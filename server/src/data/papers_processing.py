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
                course_id = f"{subject}_{course['level']}_{course['code']}".lower().replace(" ", "_")
                course['id'] = course_id
            except KeyError:
                print(f"Error: {course}, {subject}")
    # Sort the data by the top-level keys (subjects)
    sorted_data = OrderedDict(sorted(data.items()))
    return sorted_data

# Generate identifiers and sort the data
sorted_data_with_ids = generate_and_sort_identifiers(data)

# %%
# Assert that all IDs are unique
id_counts = {}

for courses in sorted_data_with_ids.values():
    for course in courses:
        course_id = course['id']
        if course_id in id_counts:
            id_counts[course_id] += 1
        else:
            id_counts[course_id] = 1

for id, count in id_counts.items():
    if count > 1:
        print(f"Duplicate ID found: {id}, Count: {count}")

#%%
# Save the sorted data with identifiers
with open(PAPERS_IDS_FILENAME, 'w') as file:
    json.dump(sorted_data_with_ids, file, indent=2)
# %%
