import React from "react";
import Checkbox from "@mui/material/Checkbox";
import { FormGroup, FormControlLabel } from "@mui/material";

function JobDetail() {
  return (
    <div className="flex flex-col gap-6 ">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold mt-8">Software Engineer</h1>
        <p className="text-sm font-light text-gray-400">
          Tech Innovation Inc. Remote
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold">Job Description</h2>
        <p className="text-sm text-justify">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore, id
          est! Distinctio, soluta vel quis perferendis quod harum aperiam quam
          ullam ad odit possimus, aspernatur, similique qui eius hic id! Lorem
          ipsum, dolor sit amet consectetur adipisicing elit. Repellat quis
          dolor sint, earum nemo eos. Corporis provident sapiente delectus
          laboriosam nisi sunt quae tenetur suscipit a impedit dolore, commodi
          ipsam. Lorem ipsum dolor sit, amet consectetur adipisicing elit.
          Architecto id aliquam expedita dicta adipisci nihil, voluptatum, eaque
          veritatis accusantium perferendis asperiores quibusdam ducimus fugiat
          facilis, porro pariatur iste quos delectus.
        </p>
      </div>
      <div className="flex flex-col gap-2 justify-start">
        <h2 className="text-xl font-bold">Responsibilities</h2>
        <FormGroup className="mt-1 grid gap-1 sm:grid-cols-2">
          <FormControlLabel
            control={<Checkbox />}
            label="Design and implement new features"
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Write unit and integration tests"
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Review code and mentor peers"
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Collaborate with product and design teams"
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Maintain CI/CD pipelines and DevOps tooling"
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Monitor performance and ensure security best practices"
          />
        </FormGroup>
      </div>
      <div className="flex flex-col gap-2 justify-start">
        <h2 className="text-xl font-bold">Requirements</h2>
        <FormGroup className="mt-1 grid gap-1 sm:grid-cols-2">
          <FormControlLabel
            control={<Checkbox />}
            label="Bachelor's degree in Computer Science or a related field."
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Write unit and integration Proven experience as a Software Engineer."
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Strong proficiency in programming languages such as Java, Python, or C++."
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Excellent problem-solving and communication skills."
          />
        </FormGroup>
      </div>
      <div className="flex justify-end">
        <button className="bg-blue-500 text-white rounded-xl p-2 focus:ring-blue-500 w-[200px]">
          Apply Now
        </button>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Related Jobs</h2>
        {[...Array(4)].map((_, i) => (
          <div
            className="flex flex-col gap-2 rounded-2xl hover:bg-gray-100 p-4 w-[300px]"
            key={i}
          >
            <p className="font-semibold">Senior Software Engineer</p>
            <p className="font-light text-gray-400 text-sm">
              Innovate Solutions Ltd.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JobDetail;
