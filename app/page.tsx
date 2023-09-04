"use client";
import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import _ from "lodash";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const randomizeStudents = (students) =>
  students.slice().sort(() => Math.random() - 0.5);

const sortByName = (students) => {
  return students
    .slice()
    .sort((a, b) => a.firstName.localeCompare(b.firstName));
};

const sortBySkill = (students) => {
  return students.slice().sort((a, b) => a.skill.localeCompare(b.skill));
};

const sortByBehavior = (students) => {
  return students.slice().sort((a, b) => a.behavior.localeCompare(b.behavior));
};

export default function Home() {
  const [students, setStudents] = useState([]);
  const [lastSortedBy, setLastSortedBy] = useState("None");

  const handleRandomizeStudents = () => {
    const newStudents = randomizeStudents(students);
    setStudents(newStudents);
    setLastSortedBy("Random");
  };

  const handleSort = (sortBy) => {
    let sortedStudents;
    switch (sortBy) {
      case "Name":
        sortedStudents = sortByName(students);
        break;
      case "Skill":
        sortedStudents = sortBySkill(students);
        break;
      case "Behavior":
        sortedStudents = sortByBehavior(students);
        break;
      default:
        return;
    }
    setStudents(sortedStudents);
    setLastSortedBy(sortBy);
  };

  const skillColors = {
    A: "green",
    B: "yellow",
    C: "orange",
    D: "red",
  };

  const behaviorEmoji = {
    good: "😇",
    bad: "😈",
  };

  const uploadJSON = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    const result = await axios.post(
      "http://localhost:3001/api/uploadJSON",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    setStudents(result.data.students);
  };

  const createGroups = () => {
    let groups = [];
    for (let i = 0; i < students.length; i += 4) {
      groups.push(students.slice(i, i + 4));
    }
    return groups;
  };

  const groups = createGroups();

  // Define an array to hold the avatar URLs
  const avatarURLs = [
    "https://github.com/Colem18.png",
    "https://github.com/marissadarnell.png",
    "https://github.com/bbmcmann.png",
    "https://github.com/noahyuen.png",
    "https://github.com/Ritvik1121.png",
    "https://github.com/ctperry0301.png",
    "https://github.com/thejameswang.png",
    "https://github.com/ghuarng.png",
    "https://github.com/rupaltotale.png",
    "https://github.com/megantrieu.png",
  ];

  // Function to pick a random avatar URL
  const getRandomAvatarURL = () => {
    const randomIndex = Math.floor(Math.random() * avatarURLs.length);
    return avatarURLs[randomIndex];
  };

  const createOptimalGroups = (students) => {
    let optimizedGroups = [];
  
    // Initialize with required data structures
    let groups = [];
    let skillMap = { A: [], B: [], C: [], D: [] };
    let genderMap = { M: [], F: [] };
    let ethnicityMap = { AA: [], AS: [], WH: [], OT: [] }; // African American, Asian, White, Other
    let behaviorMap = { good: [], bad: [] };
    let specialNeedsMap = { IEP: [], NT: [] }; // IEP and Not-IEP
  
    // Populate the above maps
    students.forEach((student) => {
      if (skillMap[student.skill]) {
        skillMap[student.skill].push(student);
      }
      // if (genderMap[student.gender]) {
      //   genderMap[student.gender].push(student);
      // }
      if (ethnicityMap[student.ethnicity]) {
        ethnicityMap[student.ethnicity].push(student);
      }
      if (behaviorMap[student.behavior]) {
        behaviorMap[student.behavior].push(student);
      }
      if (specialNeedsMap[student.specialNeeds]) {
        specialNeedsMap[student.specialNeeds].push(student);
      }
    });
    // Add randomness by shuffling
    _.forEach([skillMap, genderMap, ethnicityMap, behaviorMap, specialNeedsMap], (map) => {
      _.forEach(map, (group) => {
        group = _.shuffle(group);
      });
    });
  
    // Main group creation logic
    while (students.length > 0) {
      let group = [];
  
      // Step 1: Add one student of each skill level if possible
      ['A', 'B', 'C', 'D'].forEach((skill) => {
        if (skillMap[skill].length > 0 && group.length < 4) {
          group.push(skillMap[skill].pop());
        }
      });
  
      // Step 2: Balance Gender
      let maleCount = group.filter(s => s.gender === 'M').length;
      while (maleCount < 2 && genderMap['M'].length > 0 && group.length < 4) {
        group.push(genderMap['M'].pop());
        maleCount++;
      }
  
      // Step 3: Account for Special Needs
      if (group.some(s => s.specialNeeds === 'IEP')) {
        let nonIEP = specialNeedsMap['NT'].pop();
        if (nonIEP) group.push(nonIEP);
      }
  
      // Step 4: Add remaining based on behavior and ethnicity
      if (group.length < 4 && behaviorMap['good'].length > 0) {
        group.push(behaviorMap['good'].pop());
      }
      if (group.length < 4 && ethnicityMap['OT'].length > 0) {
        group.push(ethnicityMap['OT'].pop());
      }
  
      // Add the group to optimizedGroups
      optimizedGroups.push(group);
    }
  
    return _.flatten(optimizedGroups); // Flatten since we've been working with a 2D array
  };

  const handleCreateOptimalGroups = () => {
    const newOptimalGroups = createOptimalGroups(students);
    setStudents(newOptimalGroups);
    setLastSortedBy("Optimized");
  };

  const findIncompatiblePairs = (group) => {
    let incompatibles = [];
    for (let i = 0; i < group.length; i++) {
      const studentA = group[i];
      for (let j = i + 1; j < group.length; j++) {
        const studentB = group[j];
        if (
          studentA.enemies.includes(studentB.firstName) ||
          studentB.enemies.includes(studentA.firstName)
        ) {
          incompatibles.push([
            `${studentA.firstName} ${studentA.lastName}`,
            `${studentB.firstName} ${studentB.lastName}`,
          ]);
        }
      }
    }
    return incompatibles;
  };

  return (
    <div className="container mx-auto flex">
      {/* Left Side */}
      <ScrollArea className="w-1/4 bg-blue-100 p-4 h-screen overflow-y-auto">
        <div className="sticky top-0 z-10 bg-blue-100 p-0">
          {/* Upload JSON Button */}
          <label className="bg-blue-500 text-white p-2 mt-4 cursor-pointer">
            Upload JSON
            <input
              type="file"
              accept=".json"
              onChange={uploadJSON}
              className="hidden"
            />
          </label>

          <div className="pt-4">(Last sorted by: {lastSortedBy})</div>

          {/* Randomize Button */}
          <Button
            className="bg-green-500 text-white p-2 mt-4"
            onClick={handleRandomizeStudents}
          >
            Randomize Students
          </Button>
          <Button
            className="bg-purple-500 text-white p-2 mt-4"
            onClick={handleCreateOptimalGroups}
          >
            Create Balanced Groups
          </Button>
          <Button
            className="bg-green-500 text-white p-2 mt-4"
            onClick={() => handleSort("Name")}
          >
            Sort Name
          </Button>
          <Button
            className="bg-green-500 text-white p-2 mt-4"
            onClick={() => handleSort("Skill")}
          >
            Sort Skill
          </Button>
          <Button
            className="bg-green-500 text-white p-2 mt-4"
            onClick={() => handleSort("Behavior")}
          >
            Sort Behavior
          </Button>
        </div>
        <div className="h-[calc(100% - 4rem)] overflow-y-auto">
          <Table className="min-w-full leading-normal">
            <TableHeader>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Skill</TableCell>
                <TableCell>Behavior</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {student.firstName} {student.lastName}
                  </TableCell>
                  <TableCell>{student.skill}</TableCell>
                  <TableCell>{student.behavior}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>

      {/* Right Side */}
      <Card className="justify-center items-center w-3/4 grid grid-cols-4 gap-4 pl-12">
        {groups.map((group, groupIndex) => {
          const incompatiblePairs = findIncompatiblePairs(group);
          return (
            <Card
              key={groupIndex}
              className="border rounded-lg flex justify-center items-center relative p-2"
            >
              {incompatiblePairs.length > 0 && (
                <HoverCard>
                  <HoverCardTrigger>
                    <span className="absolute top-2 left-2 bg-red-500 rounded-full p-2">
                      ⚠️  
                    </span>
                  </HoverCardTrigger>
                  <HoverCardContent className="bg-black text-white">
                    Incompatible Students:{" "}
                    {incompatiblePairs.map((pair) => (
                      <div key={pair.join("-")}>{pair.join(" and ")}</div>
                    ))}
                  </HoverCardContent>
                </HoverCard>
              )}
              <div className="grid grid-cols-2 gap-2 p-2 w-full h-full">
                {group.map((student, index) => (
                  <Card
                    key={index}
                    className={`border p-2 flex items-center justify-center`}
                    style={{
                      width: "100px",
                      height: "100px",
                      backgroundColor: skillColors[student.skill],
                    }}
                  >
                    {/* Avatar and Emoji */}
                    <Avatar size="30" round={true} src={getRandomAvatarURL()}>
                      <AvatarFallback>{`${student.firstName[0]}${student.lastName[0]}`}</AvatarFallback>
                    </Avatar>
                    <span className="ml-2">
                      {behaviorEmoji[student.behavior]}
                    </span>
                  </Card>
                ))}
              </div>
            </Card>
          );
        })}
      </Card>
    </div>
  );
}
