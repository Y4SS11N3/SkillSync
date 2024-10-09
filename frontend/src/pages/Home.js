import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useViewportScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ChevronRightIcon,
  LightBulbIcon,
  UsersIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import ChatBot from '../components/ChatBot/ChatBot';

// Smaller component definitions
const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="relative p-8 bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
    <div className="relative z-10">
      <Icon className="h-12 w-12 text-sky-500 mb-6 transform group-hover:scale-110 transition-transform duration-300" />
      <h3 className="text-xl font-bold text-sky-900 mb-4">{title}</h3>
      <p className="text-sky-700">{description}</p>
    </div>
  </motion.div>
);

const BoardCard = ({ title, members, posts, color }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${color} relative overflow-hidden`}
      whileHover={{ 
        scale: 1.05, 
        boxShadow: "0px 10px 30px rgba(0,0,0,0.1)",
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
          <p className="text-gray-600 dark:text-gray-300">{members}</p>
        </div>
        <div className="flex items-center">
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400 mr-2" />
          <p className="text-gray-600 dark:text-gray-300">{posts}</p>
        </div>
      </div>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-500 opacity-90 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-white text-lg font-bold">Join Now</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FCard = ({ title, description, icon: Icon }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 cursor-pointer overflow-hidden relative group"
      whileHover={{ 
        scale: 1.05, 
        boxShadow: "0px 15px 30px rgba(0,0,0,0.1)",
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      <motion.div
        className="relative z-10"
        initial={{ scale: 1 }}
        animate={{ scale: isHovered ? 1.1 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <Icon className="h-16 w-16 text-sky-500 dark:text-sky-400 mb-6 transform group-hover:scale-110 transition-transform duration-300" />
      </motion.div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 relative z-10">{title}</h3>
      <motion.p 
        className="text-gray-600 dark:text-gray-300 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {description}
      </motion.p>
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-blue-500"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

const TestimonialCard = ({ testimonial }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg relative overflow-hidden"
      whileHover={{ 
        scale: 1.05, 
        boxShadow: "0px 10px 30px rgba(0,0,0,0.1)",
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
      }}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-500 opacity-90 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-white text-lg font-bold text-center">{testimonial.quote}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{testimonial.quote}</p>
      <div className="flex items-center">
        <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
          <p className="text-gray-500 dark:text-gray-400">{testimonial.title}</p>
          <p className="text-gray-500 dark:text-gray-400">{testimonial.location}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Main Home component
const Home = () => {
  const { scrollYProgress } = useViewportScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-sky-100 to-white dark:from-gray-800 dark:to-gray-900">
          <motion.div 
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 sm:py-48"
            style={{ opacity, scale }}
          >
            <div className="relative z-10 text-center">
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
              >
                <span className="block text-gray-900 dark:text-white mb-2">Revolutionize Learning with</span>
                <span className="block text-sky-600 dark:text-sky-400">SkillSync</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                className="mt-6 max-w-lg mx-auto text-xl text-gray-600 dark:text-gray-300 sm:max-w-3xl"
              >
                Decentralized peer-to-peer skill exchange platform. Connect globally, learn locally, and grow exponentially.
              </motion.p>
              <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="#get-started"
                    className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-sky-600 hover:bg-sky-700 transition-colors duration-300"
                  >
                    Get started
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="#learn-more"
                    className="flex items-center justify-center px-8 py-3 border border-sky-600 text-base font-medium rounded-full shadow-sm text-sky-600 bg-white hover:bg-sky-50 transition-colors duration-300"
                  >
                    Learn more
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>
          <div className="absolute inset-0 overflow-hidden">
            <svg
              className="absolute bottom-0 left-0 right-0 transform translate-y-1/2"
              viewBox="0 0 1440 320"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0 192L60 170.7C120 149 240 107 360 112C480 117 600 171 720 192C840 213 960 203 1080 170.7C1200 139 1320 85 1380 58.7L1440 32V320H1380C1320 320 1200 320 1080 320C960 320 840 320 720 320C600 320 480 320 360 320C240 320 120 320 60 320H0V192Z"
                fill="currentColor"
                className="text-white dark:text-gray-900"
              />
            </svg>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 sm:py-32 bg-gradient-to-b from-white to-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl font-extrabold text-sky-900 sm:text-5xl"
              >
                Discover the Power of SkillSync
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="mt-4 max-w-2xl mx-auto text-xl text-sky-700"
              >
                Unleash your potential and accelerate your growth with our innovative skill-sharing platform.
              </motion.p>
            </div>
            <motion.div 
              className="mt-20 max-w-lg mx-auto grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:max-w-none"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              <FeatureCard
                icon={LightBulbIcon}
                title="Smart Skill Matching"
                description="Our advanced system matches you with the perfect learning partners based on complementary skills and goals."
                delay={0.1}
              />
              <FeatureCard
                icon={UsersIcon}
                title="Global Skill Exchange"
                description="Connect with learners and experts worldwide, fostering cross-cultural understanding and collaboration."
                delay={0.2}
              />
              <FeatureCard
                icon={CurrencyDollarIcon}
                title="Time-Based Economy"
                description="Exchange skills using time credits instead of money. One hour teaching equals one hour learning."
                delay={0.3}
              />
              <FeatureCard
                icon={GlobeAltIcon}
                title="Diverse Learning Opportunities"
                description="Explore a wide range of skills from coding to creative arts, business to personal development."
                delay={0.4}
              />
            </motion.div>
          </div>
        </section>

        {/* Core Features Section */}
        <section className="py-24 sm:py-32 bg-gradient-to-b from-gray-100 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl"
              >
                Revolutionizing Skill Development
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300"
              >
                SkillSync uses innovative technology to connect, recognize, and verify your skills.
              </motion.p>
            </div>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              <FCard 
                title="Smart Skill Matching" 
                description="Our advanced algorithm connects you with ideal learning partners based on complementary skills and goals."
                icon={LightBulbIcon}
              />
              <FCard 
                title="Community Reputation" 
                description="Build a transparent and portable reputation based on successful skill exchanges and peer reviews."
                icon={UserGroupIcon}
              />
              <FCard 
                title="Skill Verification" 
                description="Complete peer-reviewed challenges to verify and update your skill levels, ensuring credibility in the community."
                icon={ShieldCheckIcon}
              />
            </motion.div>
          </div>
        </section>

        {/* Popular Boards Section */}
        <section className="py-24 sm:py-32 bg-gradient-to-b from-white to-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl"
              >
                Trending Skill Boards
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300"
              >
                Join our most active communities and start your skill exchange journey today!
              </motion.p>
            </div>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              <BoardCard title="Web Development" members="7,234" posts="15,567" color="border-sky-500" />
              <BoardCard title="Data Science" members="6,789" posts="13,901" color="border-green-500" />
              <BoardCard title="UX/UI Design" members="5,567" posts="11,234" color="border-purple-500" />
              <BoardCard title="Mobile App Development" members="4,123" posts="9,890" color="border-red-500" />
              <BoardCard title="Digital Marketing" members="5,890" posts="12,234" color="border-yellow-500" />
              <BoardCard title="Artificial Intelligence" members="3,456" posts="7,765" color="border-blue-500" />
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 sm:py-32 bg-gradient-to-b from-gray-100 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl"
              >
                Voices from Our Community
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300"
              >
                Hear from our global network of skill exchangers about their transformative experiences.
              </motion.p>
            </div>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={index} testimonial={testimonial} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 sm:py-32 bg-gradient-to-b from-white via-white to-sky-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl font-extrabold text-sky-900 sm:text-5xl"
              >
                How SkillSync Works
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="mt-4 max-w-2xl mx-auto text-xl text-sky-700"
              >
                Join our ecosystem of global learners in five simple steps.
              </motion.p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                {howItWorks.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className={`p-6 rounded-lg cursor-pointer transition-all duration-300 ${
                      activeStep === index ? 'bg-sky-500 text-white' : 'bg-sky-50 hover:bg-sky-100'
                    }`}
                    onClick={() => setActiveStep(index)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${activeStep === index ? 'bg-white text-sky-500' : 'bg-sky-100 text-sky-500'} rounded-full flex items-center justify-center text-xl font-bold`}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold mb-2 ${activeStep === index ? 'text-white' : 'text-sky-900'}`}>{step.title}</h3>
                        <p className={activeStep === index ? 'text-sky-100' : 'text-sky-700'}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="relative h-[500px] bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl shadow-2xl overflow-hidden">
                <motion.div
                  className="absolute inset-0 flex items-center justify-center text-9xl"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  key={activeStep}
                >
                  {howItWorks[activeStep].icon}
                </motion.div>
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-sky-600 to-transparent">
                  <h4 className="text-2xl font-bold text-white mb-2">{howItWorks[activeStep].title}</h4>
                  <p className="text-sky-100">{howItWorks[activeStep].description}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-b from-sky-50 to-white dark:from-gray-800 dark:to-gray-900 py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-10 lg:mb-0 lg:max-w-xl"
              >
                <h2 className="text-4xl sm:text-5xl font-extrabold text-sky-900 dark:text-white mb-8">
                  Join the SkillSync Revolution
                </h2>
                <p className="text-xl text-sky-700 dark:text-gray-300 mb-10">
                  Be part of a global ecosystem of learners and experts. Collaborate, share knowledge, and accelerate your growth in a decentralized, peer-to-peer environment.
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-300 transform hover:scale-105"
                >
                  Start Your Journey
                  <ChevronRightIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ChatBot */}
        <ChatBot />
      </main>
    </div>
  );
};

// Data constants
const testimonials = [
  {
    quote: "SkillSync opened doors I never knew existed. It's transforming our local tech scene!",
    name: "Ahmed Mte",
    title: "Web Developer",
    location: "Berrechid, Morocco",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg"
  },
  {
    quote: "The global reach of SkillSync is incredible. I've learned from experts across continents.",
    name: "Emily Chen",
    title: "Data Scientist",
    location: "San Francisco, USA",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg"
  },
  {
    quote: "SkillSync's time-based system made skill exchange accessible and fair for everyone.",
    name: "Luuk van der Meer",
    title: "UX Designer",
    location: "Amsterdam, Netherlands",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg"
  },
  {
    quote: "Connecting with global talents has broadened my perspective on innovation.",
    name: "Ling Wei",
    title: "Software Engineer",
    location: "Shanghai, China",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg"
  },
  {
    quote: "SkillSync helped me pivot my career by learning cutting-edge skills from industry leaders.",
    name: "Mark Thompson",
    title: "Digital Marketer",
    location: "Sydney, Australia",
    avatar: "https://randomuser.me/api/portraits/men/5.jpg"
  }
];

const howItWorks = [
  {
    title: "Create Your Profile",
    description: "Sign up and list the skills you want to learn and the skills you can teach.",
    icon: "👤"
  },
  {
    title: "Discover Matches",
    description: "Our system recommends potential skill exchange partners based on your interests and expertise.",
    icon: "🔍"
  },
  {
    title: "Connect & Exchange Skills",
    description: "Use our virtual skill rooms to teach and learn with your matched partners.",
    icon: "🤝"
  },
  {
    title: "Search & Explore",
    description: "Utilize our advanced search feature to find specific skills you want to exchange, with match percentage indicators.",
    icon: "🌐"
  },
  {
    title: "Grow Your Network",
    description: "As you exchange more skills, expand your network and discover new learning opportunities.",
    icon: "🌱"
  }
];

export default Home;
