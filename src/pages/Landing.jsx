import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { testimonials } from "../data/testimonials";

const colors = {
  primary: "#2563eb",
  primaryLight: "#3b82f6",
  dark: "#1e293b",
  light: "#f8fafc",
  accent: "#64748b",
  success: "#10b981",
  error: "#ef4444",
};

const Landing = () => {
  const selectedTestimonials = [...testimonials];

  const stats = [
    { value: "+85%", label: "Industrial Experience" },
    { value: "+5000", label: "Past interns" },
    { value: "25", label: "Departments" },
  ];

  const positions = [
    {
      title: "Software Development",
      department: "Engineering",
      duration: "3-6 months",
    },
    {
      title: "Marketing Intern",
      department: "Marketing",
      duration: "4-6 months",
    },
    {
      title: "Data Analyst",
      department: "Data Science",
      duration: "3-5 months",
    },
    { title: "UX/UI Design", department: "Product", duration: "4-6 months" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0]">
      <div className="relative bg-gradient-to-r from-[#1e40af] to-[#2563eb] text-white py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-20 w-64 h-64 bg-white rounded-full mix-blend-overlay"></div>
          <div className="absolute bottom-0 right-20 w-64 h-64 bg-white rounded-full mix-blend-overlay"></div>
        </div>
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center py-6 relative z-50"
          >
            <div className="flex items-center space-x-8">
              <img 
                className="h-12 w-auto rounded" 
                src="https://techrevolutionafrica.org/wp-content/uploads/2024/10/NIGSOMSAT-4.png" 
                alt="NIGSOMSAT Logo" 
              />
              <nav className="hidden md:flex space-x-8">
                <Link to="/" className="text-white hover:text-blue-200 transition-colors">
                  Home
                </Link>
                <Link to="/programs" className="text-white hover:text-blue-200 transition-colors">
                  Programs
                </Link>
                <Link to="/intern-positions" className="text-white hover:text-blue-200 transition-colors">
                  Positions
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/auth"
                className="text-white hover:text-blue-200 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors"
              >
                Register
              </Link>
            </div>
          </motion.div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <h1 className="text-5xl md:text-6xl font-bold pb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              Internship Program
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
              Gain real-world experience and kickstart your career with our
              comprehensive internship program.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/programs"
                className="inline-block bg-white text-[#2563eb] px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                View Programs
              </Link>
              <Link
                to="/register"
                className="inline-block border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-4xl font-bold text-[#2563eb]">
                  {stat.value}
                </p>
                <p className="text-lg text-[#64748b] mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#2563eb] font-semibold">WHY CHOOSE US</span>
            <h2 className="text-4xl font-bold text-[#1e293b] mt-2">
              Our Internship Benefits
            </h2>
            <div className="w-24 h-1 bg-[#2563eb] mx-auto mt-4"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Hands-on Experience",
                description:
                  "Work on real projects that impact our business and customers.",
                icon: (
                  <svg
                    className="w-12 h-12 text-[#2563eb]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                ),
              },
              {
                title: "Mentorship",
                description:
                  "Learn from experienced professionals in your field.",
                icon: (
                  <svg
                    className="w-12 h-12 text-[#2563eb]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                ),
              },
              {
                title: "Career Growth",
                description:
                  "Many of our interns receive full-time offers after graduation.",
                icon: (
                  <svg
                    className="w-12 h-12 text-[#2563eb]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                ),
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="flex justify-center mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-center text-[#1e293b]">
                  {feature.title}
                </h3>
                <p className="text-[#64748b] text-center">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div id="positions" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#f1f5f9]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#2563eb] font-semibold">OPPORTUNITIES</span>
            <h2 className="text-4xl font-bold text-[#1e293b] mt-2">
              Available Internship Positions
            </h2>
            <div className="w-24 h-1 bg-[#2563eb] mx-auto mt-4"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {positions.map((position, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-[#1e293b]">
                        {position.title}
                      </h3>
                      <p className="text-[#64748b] mt-1">
                        {position.department}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-[#2563eb]">
                      {position.duration}
                    </span>
                  </div>
                  <div className="mt-6 flex justify-between items-center">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-[#64748b]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="ml-2 text-sm text-[#64748b]">
                        Remote/On-site
                      </span>
                    </div>
                    <Link
                      to="/programs"
                      className="text-[#2563eb] hover:text-[#1d4ed8] font-medium transition-colors"
                    >
                      View Programs →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              to="/intern-positions"
              className="inline-block border-2 border-[#2563eb] text-[#2563eb] px-6 py-3 rounded-lg font-medium hover:bg-[#2563eb] hover:text-white transition-all duration-300"
            >
              View All Positions
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#2563eb] font-semibold">PROCESS</span>
            <h2 className="text-4xl font-bold text-[#1e293b] mt-2">
              Our Application Timeline
            </h2>
            <div className="w-24 h-1 bg-[#2563eb] mx-auto mt-4"></div>
          </motion.div>

          <div className="relative">
            <div className="hidden md:block absolute left-1/2 h-full w-1 bg-[#2563eb] bg-opacity-20 transform -translate-x-1/2"></div>

            <div className="space-y-8 md:space-y-16">
              {[
                {
                  step: "1",
                  title: "Application Submission",
                  description:
                    "Submit your application through our online portal",
                  date: "Rolling Basis",
                },
                {
                  step: "2",
                  title: "Initial Screening",
                  description: "Our team reviews your application materials",
                  date: "Less than 2 days",
                },
                {
                  step: "3",
                  title: "Interviews",
                  description:
                    "Successful candidates will be invited for interviews",
                  date: "A day after review",
                },
                {
                  step: "4",
                  title: "Offer Decision",
                  description: "Final decisions are made and offers extended",
                  date: "Within 1 Week",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative flex flex-col md:flex-row items-center ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div
                    className={`md:w-1/2 p-6 ${
                      index % 2 === 0
                        ? "md:pr-8 md:text-right"
                        : "md:pl-8 md:text-left"
                    }`}
                  >
                    <div className="inline-block bg-[#2563eb] text-white rounded-full w-12 h-12 items-center justify-center mb-4">
                      <div className="w-full h-full flex justify-center items-center">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-[#1e293b]">
                      {item.title}
                    </h3>
                    <p className="text-[#64748b] mt-2">{item.description}</p>
                    <div className="mt-3 text-sm font-medium text-[#2563eb]">
                      {item.date}
                    </div>
                  </div>
                  <div className="hidden md:block w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="text-[#2563eb] text-center mt-8">
            <h2 className="font-semibold text-3xl">All within a week</h2>
          </div>
        </div>
      </div>

      <div
        id="testimonials"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-[#f1f5f9]"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#2563eb] font-semibold">TESTIMONIALS</span>
            <h2 className="text-4xl font-bold text-[#1e293b] mt-2">
              What Our Alumni Say
            </h2>
            <div className="w-24 h-1 bg-[#2563eb] mx-auto mt-4"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {selectedTestimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-tl-4xl rounded-br-4xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex flex-col md:flex-row h-full">
                  <div className="w-full md:w-50 h-40 md:h-auto bg-gray-100 relative overflow-hidden">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover absolute inset-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-0 md:opacity-20 pointer-events-none" />
                  </div>

                  <div className="p-6 md:p-8 flex-1 flex flex-col">
                    <div className="relative">
                      <div className="text-5xl font-bold text-blue-600 opacity-10 absolute -top-6 -left-2">
                        "
                      </div>
                      <p className="text-gray-700 text-lg leading-relaxed mb-6 relative z-10">
                        {testimonial.quote}
                      </p>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <h4 className="font-semibold text-gray-900">
                        {testimonial.name}
                      </h4>
                      <p className="text-gray-500 text-sm">
                        {testimonial.position}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#2563eb] font-semibold">FAQ</span>
            <h2 className="text-4xl font-bold text-[#1e293b] mt-2">
              Frequently Asked Questions
            </h2>
            <div className="w-24 h-1 bg-[#2563eb] mx-auto mt-4"></div>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                question: "What are the eligibility requirements?",
                answer:
                  "Applicants must be currently enrolled in a degree program or have graduated within the last 6 months. Specific requirements vary by position.",
              },
              {
                question: "Can international students apply?",
                answer:
                  "Yes, we welcome applications from international students who have proper work authorization for the country where the internship is located.",
              },
              {
                question: "What is the duration of the internship?",
                answer:
                  "Our internships typically last between 3-6 months, with flexible start dates throughout the year.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <details className="group">
                  <summary className="list-none p-6 cursor-pointer flex justify-between items-center">
                    <h3 className="text-lg font-medium text-[#1e293b]">
                      {faq.question}
                    </h3>
                    <svg
                      className="w-6 h-6 text-[#2563eb] transform group-open:rotate-180 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="px-6 pb-6 pt-0 text-[#64748b]">
                    {faq.answer}
                  </div>
                </details>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-15 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold">Ready to Start Your Journey?</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Apply now and take the first step towards an exciting career.
            </p>
            <div className="pt-4">
              <Link
                to="/programs"
                className="inline-block bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-10 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                View Programs
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
