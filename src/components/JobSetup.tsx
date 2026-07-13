import React, { useState } from "react";
import { Button } from "./ui/Button.jsx";
import { Card, CardHeader, CardContent } from "./ui/Card.jsx";
import { Badge } from "./ui/Badge.jsx";
import { CompetencyLevel, CompetencyRequirement, JobRole } from "../types/index.js";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

interface JobSetupProps {
  onBack: () => void;
  onJobCreated: (job: JobRole) => void;
}

export const JobSetup: React.FC<JobSetupProps> = ({ onBack, onJobCreated }) => {
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [description, setDescription] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<CompetencyLevel>(CompetencyLevel.MID);
  
  // Dynamic Competencies
  const [competencies, setCompetencies] = useState<CompetencyRequirement[]>([
    { name: "Technical Execution", description: "Demonstrates practical problem-solving & clean patterns.", level: CompetencyLevel.MID },
    { name: "Architectural Reasoning", description: "Plans modular, secure system components.", level: CompetencyLevel.SENIOR }
  ]);
  const [newCompName, setNewCompName] = useState("");
  const [newCompDesc, setNewCompDesc] = useState("");
  const [newCompLevel, setNewCompLevel] = useState<CompetencyLevel>(CompetencyLevel.MID);

  // Dynamic Questions
  const [questions, setQuestions] = useState<string[]>([
    "Can you share an experience where you had to solve a highly ambiguous technical bottleneck?",
    "How do you design APIs that stay clean and scalable as feature complexity scales?"
  ]);
  const [newQuestion, setNewQuestion] = useState("");

  const handleAddCompetency = () => {
    if (!newCompName.trim() || !newCompDesc.trim()) return;
    setCompetencies([
      ...competencies,
      { name: newCompName, description: newCompDesc, level: newCompLevel }
    ]);
    setNewCompName("");
    setNewCompDesc("");
  };

  const handleRemoveCompetency = (index: number) => {
    setCompetencies(competencies.filter((_, i) => i !== index));
  };

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    setQuestions([...questions, newQuestion]);
    setNewQuestion("");
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || competencies.length === 0) return;

    const payload = {
      title,
      department,
      description,
      experienceLevel,
      competencies,
      customQuestions: questions
    };

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Could not create job posting.");
      const data: JobRole = await response.json();
      onJobCreated(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Configure Interview Campaign</h1>
            <p className="text-sm text-slate-500">Set targeted evaluation competencies & custom prompts</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-slate-800">1. Position Details</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Architect"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-slate-800"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Product Management">Product Management</option>
                  <option value="Design">Design</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-semibold text-slate-600">Job Summary & Mandate</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the target role responsibilities, challenges, and tech stack stack..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Target Experience Tier</label>
              <div className="flex gap-2">
                {Object.values(CompetencyLevel).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                      experienceLevel === lvl
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competencies Section */}
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-slate-800">2. Evaluation Matrix (Target Competencies)</h2>
            <p className="text-xs text-slate-500 mt-0.5">Define core skills Gemini will look for and rate</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {competencies.length > 0 && (
              <div className="border border-slate-100 rounded-lg divide-y divide-slate-50">
                {competencies.map((comp, idx) => (
                  <div key={idx} className="p-3.5 flex items-start justify-between gap-4 bg-slate-50/30">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-800">{comp.name}</span>
                        <Badge variant="info">{comp.level}</Badge>
                      </div>
                      <p className="text-xs text-slate-500">{comp.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCompetency(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 border border-dashed border-slate-200 rounded-xl space-y-3 bg-slate-50/10">
              <span className="text-xs font-semibold text-slate-700 block">Add Evaluation Dimension</span>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Competency Name (e.g. System Design)"
                  value={newCompName}
                  onChange={(e) => setNewCompName(e.target.value)}
                  className="col-span-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-800 bg-white"
                />
                <select
                  value={newCompLevel}
                  onChange={(e) => setNewCompLevel(e.target.value as CompetencyLevel)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-slate-800"
                >
                  {Object.values(CompetencyLevel).map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                placeholder="What evidence should the AI look for? (e.g. experience deploying CDNs)"
                value={newCompDesc}
                onChange={(e) => setNewCompDesc(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-800 bg-white"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddCompetency} className="w-full">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Competency
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Guided Interview Script */}
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-slate-800">3. Core Interview Script</h2>
            <p className="text-xs text-slate-500 mt-0.5">Target question blueprints. HireMind AI adapts conversation dynamically based on candidate responses.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.length > 0 && (
              <div className="space-y-2">
                {questions.map((q, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between gap-3">
                    <span className="text-xs font-mono text-slate-400">Q{idx + 1}</span>
                    <p className="text-xs text-slate-700 flex-1">{q}</p>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a new structured question prompt..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-800"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddQuestion}>
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={!title || !description || competencies.length === 0}>
            Create Job Campaign
          </Button>
        </div>
      </form>
    </div>
  );
};
