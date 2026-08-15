import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Filter, X } from "lucide-react";
import { useState } from "react";

export default function JobFiltersSection() {
  const [showFilters, setShowFilters] = useState(false);
  const [salaryRange, setSalaryRange] = useState([50, 200]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);

  const jobTypes = ["Full-time", "Part-time", "Contract", "Freelance"];
  const locations = ["Remote", "On-site", "Hybrid"];
  const experience = ["Entry Level", "Mid Level", "Senior", "Executive"];

  const toggleJobType = (type: string) => {
    setSelectedJobTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <section className="py-8 bg-gradient-to-b from-secondary/5 to-background border-b border-secondary/20">
      <div className="container">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex-1 w-full">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search jobs by title, company, or skills..."
                className="flex-1 border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
              />
              <Button className="bg-gradient-to-r from-primary to-accent text-white font-semibold px-6 rounded-lg hover:shadow-lg transition-all duration-300">
                Search
              </Button>
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-secondary/30 hover:border-primary/50 text-foreground hover:text-primary transition-all duration-300 whitespace-nowrap"
          >
            <Filter className="w-4 h-4" />
            Filters
            {showFilters && <X className="w-4 h-4" />}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="p-6 bg-gradient-to-br from-white to-secondary/5 border-2 border-secondary/20 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Job Type */}
              <div>
                <h4 className="font-semibold text-foreground mb-4">Job Type</h4>
                <div className="space-y-3">
                  {jobTypes.map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <Checkbox
                        checked={selectedJobTypes.includes(type)}
                        onCheckedChange={() => toggleJobType(type)}
                        className="border-2 border-secondary/30 group-hover:border-primary/50 transition-colors duration-300"
                      />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <h4 className="font-semibold text-foreground mb-4">Location</h4>
                <Select>
                  <SelectTrigger className="border-2 border-secondary/30 focus:border-primary/50 rounded-lg">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Experience Level */}
              <div>
                <h4 className="font-semibold text-foreground mb-4">
                  Experience
                </h4>
                <Select>
                  <SelectTrigger className="border-2 border-secondary/30 focus:border-primary/50 rounded-lg">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experience.map((exp) => (
                      <SelectItem key={exp} value={exp}>
                        {exp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Salary Range */}
              <div>
                <h4 className="font-semibold text-foreground mb-4">
                  Salary Range
                </h4>
                <div className="space-y-4">
                  <Slider
                    value={salaryRange}
                    onValueChange={setSalaryRange}
                    min={0}
                    max={300}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${salaryRange[0]}K</span>
                    <span>${salaryRange[1]}K</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-secondary/20">
              <Button className="bg-gradient-to-r from-primary to-accent text-white font-semibold px-6 rounded-lg hover:shadow-lg transition-all duration-300">
                Apply Filters
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedJobTypes([]);
                  setSalaryRange([50, 200]);
                }}
                className="border-2 border-secondary/30 hover:border-primary/50 transition-colors duration-300"
              >
                Reset
              </Button>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}
