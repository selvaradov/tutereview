# %%
# Import libraries
import json
import requests
import re
from tqdm import tqdm
import os
from openai import OpenAI

# %%
# Constants
HEADERS = {
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Origin": "https://examregs.admin.ox.ac.uk",
    "Referer": "https://examregs.admin.ox.ac.uk/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest",
    "Connection": "keep-alive",
    # to get the cookie values, open the website in a browser and retrieve manually using developer tools
    "Cookie": "ASP.NET_SessionId=XXX; ARRAffinity=XXX; ARRAffinitySameSite=XXX; ASLBSA=XXX; ASLBSACORS=XXX",
}
TYPEAHEAD_URL = "https://examregs.admin.ox.ac.uk/Home/RegulationTypeahead"
SEARCH_URL = "https://examregs.admin.ox.ac.uk/Home/RegulationSearch"
TYPEAHEAD_DATA = {"searchString": ""}
TYPEAHEAD_FILENAME = "scraping/typeahead_results.json"
RESPONSES_FILENAME = "scraping/responses.json"
LINKS_FILENAME = "scraping/links.json"
REGULATIONS_FILENAME = "scraping/regulations.json"
MAPPINGS_FILENAME = "scraping/mappings.json"
API_SECRET = os.getenv("OPENAI_API_KEY")

def load_json_data(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data

def save_json_data(data, file_path):
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=4)

# %%
# Fetch IDs for all courses
if os.path.exists(TYPEAHEAD_FILENAME):
    typeahead_results = load_json_data(TYPEAHEAD_FILENAME)
    print("Typeahead results loaded from typeahead_results.json")
else:
    print("Fetching typeahead results")
    typeahead_response = requests.post(TYPEAHEAD_URL, headers=HEADERS, data=TYPEAHEAD_DATA)
    typeahead_results = typeahead_response.json()
    save_json_data(typeahead_results, TYPEAHEAD_FILENAME)
    print("Typeahead results saved to typeahead_results.json")

# %%
# Get regulation search results for undergraduate courses
if os.path.exists(RESPONSES_FILENAME):
    responses = load_json_data(RESPONSES_FILENAME)
    print("Responses loaded from responses.json")
else:
    print("Fetching responses for undergraduate courses")
    undergrad_courses = [entry for entry in typeahead_results if entry["CourseLevel"] == 1]
    responses = []
    errors = []

    for course in tqdm(undergrad_courses):
        post_data = {"RegulationId": course["Id"]}
        response = requests.post(SEARCH_URL, headers=HEADERS, data=post_data)
        if response.status_code == 200:
            course["response"] = response.text
            responses.append(course)
        else:
            errors.append({course["Id"]: response.status_code})

    if errors:
        print(f"{len(errors)} errors occurred")
        print(errors)

    save_json_data(responses, RESPONSES_FILENAME)
    print("Responses saved to responses.json")
# %%
# Extract links from search results
if os.path.exists(LINKS_FILENAME):
    links = load_json_data(LINKS_FILENAME)
    print("Links loaded from links.json")
else:
    print("Extracting links from responses")
    link_pattern = re.compile(r'/Regulation\?code[^"]+')
    ended_pattern = re.compile(r"ended in \d{4}")
    links = []

    for response in responses:
        if ended_pattern.search(response["response"]):
            print(f"{response['Name']} has ended")
            continue
        link_matches = link_pattern.findall(response["response"])
        if len(link_matches) != 1:
            print(f"Expected 1 link for {response['Name']}, found {len(link_matches)}")
            continue
        link = link_matches[0]
        del response["response"]
        response["link"] = f"https://examregs.admin.ox.ac.uk{link}"
        links.append(response)

    save_json_data(links, LINKS_FILENAME)
    print("Links saved to links.json")

# %%
# Fetch regulations for courses of interest
if os.path.exists(REGULATIONS_FILENAME):
    regulations = load_json_data(REGULATIONS_FILENAME)
    print("Regulations loaded from regulations.json")
else:
    print("Fetching regulations for standard subjects")
    standard_subject_type = re.compile(
        r"FPE|FHS|Moderations|Honour|Prelim|Regulation"
    )  # not including Foundation Year courses for now

    regulations = []
    errors = []

    for course in tqdm(links):
        if not standard_subject_type.search(course["Name"]):
            print(f"Skipping {course['Name']}")
            continue
        response = requests.get(course["link"], headers=HEADERS)
        if response.status_code == 200:
            course["html"] = response.text
            regulations.append(course)
        else:
            errors.append({course["Name"]: response.status_code})

    if errors:
        print(f"{len(errors)} errors occurred")
        print(errors)

    save_json_data(regulations, REGULATIONS_FILENAME)
    print("Regulations saved to regulations.json")

# %%
# Use OpenAI to extract each course's papers, based on regulations
if os.path.exists(MAPPINGS_FILENAME):
    mappings = load_json_data(MAPPINGS_FILENAME)
    print("Mappings loaded from mappings.json")
else:
    print("Extracting papers from regulations with OpenAI")
    client = OpenAI(api_key=API_SECRET)
    prompt = """
    Read this file. Tell me all the papers that students of this subject may take in the format of a JSON, which looks like
    {SUBJECT: [{"code": CODE, "name": NAME, "level": LEVEL}, ...]}
    where: 
    SUBJECT is the name of the subject, ignoring any additional information in parentheses or about the level of the exams;
    CODE is the code or number attached to the paper, otherwise simply sequential, but always as a string;
    NAME is the name of the paper as given;
    LEVEL is "Finals" if the regulations are about finals exams, "Prelims" if about preliminary exams, "Mods" if about moderations, and blank if unclear
    Do not surround your response in code fences: output only the valid JSON data.
    """

    subject_paper_mappings = []
    raw = []

    def get_relevant_portion(text: str):
        start = text.find("You are viewing")
        end = text.find("section-index-sidebar-wrapper")
        portion = text[start:end]
        portion = re.sub(r'<p\s+style.*>', '', portion)
        portion = re.sub(r'<span.*>', '', portion)
        return portion

    for course in tqdm(regulations):
        chat_history = [{"role": "system", "content": "You are a helpful assistant."}]
        html = course["html"]
        portion = get_relevant_portion(html)
        instructions = prompt + "```\n" + portion + "\n```"
        chat_history.append({"role": "user", "content": instructions})
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=chat_history
        )
        try:
            subject_paper_mappings.append(json.loads(response.choices[0].message.to_dict()["content"]))
        except json.JSONDecodeError:
            raw.append(response.choices[0].message.to_dict()["content"])
            print(f"Could not parse response for {course['Name']}")

    if raw:
        print(f"{len(raw)} responses were invalid JSON:")
        print(raw)

    save_json_data(subject_paper_mappings, MAPPINGS_FILENAME)
    
# %%
for mapping in mappings:
    print(list(mapping.keys())[0])
# %%
