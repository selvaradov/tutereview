# %%

import json
from collections import OrderedDict

PAPERS_FILENAME = "papers.json"
PAPERS_IDS_FILENAME = "papers_ids_sorted.json"

# Load the original data
with open(PAPERS_FILENAME, 'r') as file:
    data = json.load(file)

# %%
def generate_and_sort_identifiers(data):
    # Generate identifiers
    for subject, courses in data.items():
        for course in courses:
            try:
                course_id = f"{subject}_{course['level']}_{course['code']}".lower()
                course['id'] = course_id
            except KeyError:
                print(f"Error: {course}, {subject}")
    # Sort the data by the top-level keys (subjects)
    sorted_data = OrderedDict(sorted(data.items()))
    return sorted_data

# Generate identifiers and sort the data
sorted_data_with_ids = generate_and_sort_identifiers(data)

#%%
# Save the sorted data with identifiers
with open(PAPERS_IDS_FILENAME, 'w') as file:
    json.dump(sorted_data_with_ids, file, indent=2)
# %%
