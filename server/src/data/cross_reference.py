# %%
import json

def load_json_data(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data
# %%
courses_data = load_json_data('courses.json') # machine-friendly identifiers for each course, and then the human-readable name
subjects_data = load_json_data('subjects.json') # maps the course identifiers to the subjects they contain

# Extract the 'value' from each item in the first file
identifiers_courses = [course['value'] for course in courses_data]

# Extract keys from the second file
keys_subjects = list(subjects_data.keys())

# Verify 1:1 mapping
def verify_mapping(identifiers, keys):
    missing_keys = [identifier for identifier in identifiers if identifier not in keys]
    extra_keys = [key for key in keys if key not in identifiers]

    if not missing_keys and not extra_keys:
        print("There is a 1:1 mapping between identifiers in the first file and keys in the second.")
    else:
        if missing_keys:
            print("The following identifiers from the first file are missing as keys in the second file:")
            print(missing_keys)
        if extra_keys:
            print("The following key(s) in the second file do not have a corresponding identifier in the first file:")
            print(extra_keys)

# Perform the verification
verify_mapping(identifiers_courses, keys_subjects)
# %%
