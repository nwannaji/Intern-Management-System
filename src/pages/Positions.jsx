import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Positions = () => {
  const allPositions = [
   {
  id: 1,
  title: "Software Development Intern",
  department: "Engineering",
  description: "Work on cutting-edge software projects with our engineering team.",
  skills: ["JavaScript", "React", "Node.js"]
  },
  {
    id: 2,
    title: "Marketing Intern",
    department: "Marketing",
    description: "Assist in developing and executing marketing campaigns.",
    skills: ["Social Media", "Content Creation", "SEO"]
  },
  {
    id: 3,
    title: "IT Support Intern",
    department: "IT",
    description: "Provide technical support and troubleshoot IT issues.",
    skills: ["Helpdesk", "Networking", "Hardware"]
  },
  {
    id: 4,
    title: "UX/UI Design Intern",
    department: "Product",
    description: "Design intuitive user interfaces for our digital products.",
    skills: ["Figma", "User Research", "Prototyping"]
  },
  {
    id: 5,
    title: "Business Analyst Intern",
    department: "Finance",
    description: "Conduct market research and analyze business metrics.",
    skills: ["Excel", "Data Analysis", "Presentation"]
  },
  {
    id: 6,
    title: "DevOps Engineering Intern",
    department: "Engineering",
    description: "Assist in CI/CD pipeline management and cloud infrastructure.",
    skills: ["AWS", "Docker", "Kubernetes"]
  },
  {
    id: 7,
    title: "Digital Marketing Intern",
    department: "Marketing",
    description: "Optimize online campaigns and analyze digital performance.",
    skills: ["Google Ads", "Analytics", "PPC"]
  },
  {
    id: 8,
    title: "Supply Chain Intern",
    department: "Operations",
    description: "Support logistics, procurement, and inventory management.",
    skills: ["ERP Systems", "Logistics", "Excel"]
  },
  {
    id: 9,
    title: "Cybersecurity Intern",
    department: "IT",
    description: "Assist in security audits and threat detection.",
    skills: ["Ethical Hacking", "SIEM Tools", "Firewalls"]
  },
  {
    id: 10,
    title: "Product Management Intern",
    department: "Product",
    description: "Help define product roadmaps and user stories.",
    skills: ["JIRA", "Agile", "Market Research"]
  },
  {
    id: 11,
    title: "HR Recruitment Intern",
    department: "HR",
    description: "Assist in talent acquisition and employer branding.",
    skills: ["LinkedIn Recruiter", "Interviewing", "ATS"]
  },
  {
    id: 12,
    title: "Financial Analyst Intern",
    department: "Finance",
    description: "Support financial modeling and forecasting.",
    skills: ["Excel", "Power BI", "Financial Reporting"]
  },
  {
    id: 13,
    title: "Frontend Developer Intern",
    department: "Engineering",
    description: "Build responsive web applications.",
    skills: ["HTML/CSS", "React", "TypeScript"]
  },
  {
    id: 14,
    title: "Social Media Intern",
    department: "Marketing",
    description: "Manage brand presence across platforms.",
    skills: ["Instagram", "TikTok", "Content Scheduling"]
  },
  {
    id: 15,
    title: "Operations Analyst Intern",
    department: "Operations",
    description: "Optimize business processes and workflows.",
    skills: ["Process Mapping", "Six Sigma", "Data Analysis"]
  },
  {
    id: 16,
    title: "Database Admin Intern",
    department: "IT",
    description: "Assist in database management and optimization.",
    skills: ["SQL", "NoSQL", "Backup Recovery"]
  },
  {
    id: 17,
    title: "Technical Writer Intern",
    department: "Product",
    description: "Create documentation for software and APIs.",
    skills: ["Markdown", "Git", "API Docs"]
  },
  {
    id: 18,
    title: "Talent Development Intern",
    department: "HR",
    description: "Support employee training programs.",
    skills: ["LMS", "Workshop Coordination", "Feedback Analysis"]
  },
  {
    id: 19,
    title: "Investment Analyst Intern",
    department: "Finance",
    description: "Research market trends and investment opportunities.",
    skills: ["Bloomberg Terminal", "Valuation", "Risk Assessment"]
  },
  {
    id: 20,
    title: "Backend Developer Intern",
    department: "Engineering",
    description: "Work on server-side logic and APIs.",
    skills: ["Python", "Django", "REST APIs"]
  },
  {
    id: 21,
    title: "Brand Marketing Intern",
    department: "Marketing",
    description: "Assist in brand strategy and campaign execution.",
    skills: ["Copywriting", "Brand Guidelines", "Competitive Analysis"]
  },
  {
    id: 22,
    title: "Quality Assurance Intern",
    department: "Operations",
    description: "Test products and ensure compliance.",
    skills: ["Testing Frameworks", "Bug Tracking", "Regression Testing"]
  },
  {
    id: 23,
    title: "Network Engineer Intern",
    department: "IT",
    description: "Assist in maintaining and securing networks.",
    skills: ["Cisco", "Firewalls", "TCP/IP"]
  },
  {
    id: 24,
    title: "HR Analytics Intern",
    department: "HR",
    description: "Analyze workforce data for insights.",
    skills: ["People Analytics", "Excel", "Dashboards"]
  },
  {
    id: 25,
    title: "Corporate Finance Intern",
    department: "Finance",
    description: "Support budgeting and financial planning.",
    skills: ["Financial Modeling", "Forecasting", "Excel"]
  },
  ];


  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredPositions, setFilteredPositions] = useState(allPositions);
  const positionsPerPage = 6;

  const departments = ["All Departments", ...new Set(allPositions.map(pos => pos.department))];

  useEffect(() => {
    let filtered = allPositions;
    
    if (departmentFilter !== "All Departments") {
      filtered = filtered.filter(pos => pos.department === departmentFilter);
    }

    setFilteredPositions(filtered);
    setCurrentPage(1); 
  }, [departmentFilter]);

  const indexOfLastPosition = currentPage * positionsPerPage;
  const indexOfFirstPosition = indexOfLastPosition - positionsPerPage;
  const currentPositions = filteredPositions.slice(indexOfFirstPosition, indexOfLastPosition);
  const totalPages = Math.ceil(filteredPositions.length / positionsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const renderPageNumbers = () => {
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = [];
    
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("...");
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages.map((number, index) => (
      <button
        key={index}
        onClick={() => typeof number === 'number' ? paginate(number) : null}
        className={`px-3 py-1 rounded-md ${currentPage === number ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        disabled={number === "..."}
      >
        {number}
      </button>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0]">
      <div className="relative bg-gradient-to-r from-[#1e40af] to-[#2563eb] text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-20 w-64 h-64 bg-white rounded-full mix-blend-overlay"></div>
          <div className="absolute bottom-0 right-20 w-64 h-64 bg-white rounded-full mix-blend-overlay"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Available Internship Positions</h1>
            <p className="text-xl md:text-xl mb-8 max-w-3xl mx-auto text-blue-100">
              Browse through our current openings and find the perfect internship for your career goals.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{filteredPositions.length} Open Positions</h2>
              <p className="text-gray-600">Filter and find your perfect match</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select 
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentPositions.map((position, index) => (
              <motion.div
                key={position.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.1, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
              >
                <div className="p-6 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{position.title}</h3>
                      <p className="text-gray-600 mt-1">{position.department}</p>
                    </div>
                  </div>
                  
                  
                  <p className="text-gray-700 mb-4 flex-grow">{position.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {position.skills.map((skill, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Link
                    to={`/apply-for-internship/${position.id}`}
                    className="mt-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Apply Now
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredPositions.length > positionsPerPage && (
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button 
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {renderPageNumbers()}
                
                <button 
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>

      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold">Can't find what you're looking for?</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Join our talent community to be notified about new opportunities.
            </p>
            <div className="pt-4">
              <Link
                to="/talent-community"
                className="inline-block bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Join Talent Community
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Positions;