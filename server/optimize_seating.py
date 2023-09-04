import sys
import json
import random

def optimize_seating(students):
    # Sort students by skill level
    students.sort(key=lambda x: x['skill'])
    
    # Group students by bad behavior
    bad_behavior_students = [s for s in students if s['behavior'] == 'bad']
    good_behavior_students = [s for s in students if s['behavior'] != 'bad']
    
    # Create empty seating groups
    num_groups = len(students) // 4
    seating = [[] for _ in range(num_groups)]

    # Place students with special needs near the front or the door
    for idx, student in enumerate(students):
        if student['IEP504Needs'] == 'front':
            seating[0].append(student)
        elif student['IEP504Needs'] == 'door':
            seating[-1].append(student)

    # Distribute good behavior students evenly
    for idx, student in enumerate(good_behavior_students):
        group = seating[idx % num_groups]
        if len(group) < 4:
            group.append(student)

    # Add bad behavior students while avoiding putting them together
    for idx, student in enumerate(bad_behavior_students):
        for group in seating:
            if len(group) < 4 and not any(s['behavior'] == 'bad' for s in group):
                group.append(student)
                break

    return seating

if __name__ == "__main__":
    students = json.loads(sys.argv[1])
    optimized_students = optimize_seating(students)
    print(json.dumps(optimized_students))
