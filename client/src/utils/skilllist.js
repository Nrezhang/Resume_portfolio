import {SiPython, SiJavascript, SiOpenai, SiFlask, SiDjango, SiGooglebigquery, SiLooker} from 'react-icons/si';
import { FaJava, FaReact, FaGitAlt, FaDocker, FaPeopleCarry} from "react-icons/fa";
import { BsFiletypeHtml, BsFiletypeCss, BsFiletypeSql, BsGraphUpArrow } from "react-icons/bs";
import { TbApi, TbBarbell } from "react-icons/tb";
import { IoIosPeople } from "react-icons/io";
import { GiTeacher } from "react-icons/gi";
import { RiTranslate } from "react-icons/ri";
export const languages = [
    {
        _id:1,
        name: 'Python',
        icon: SiPython,
        desc: "My go-to Language! Most proficent in python",
        proficiency: "99%"
    },
    {
        _id:2,
        name: 'Java',
        icon: FaJava,
        desc: "My first Language! Started learning Java in High-School",
        proficiency: "90%"

    },
    {
        _id:3,
        name: 'HTML',
        icon: BsFiletypeHtml,
        desc: "Lots of practice with HTML and CSS when I make my websites/projects",
        proficiency: "70%"

    },
    {
        _id:4,
        name: 'CSS',
        icon: BsFiletypeCss,
        desc: "Lots of practice with HTML and CSS when I make my websites/projects",
        proficiency: "70%"

    },
    {
        _id:5,
        name: 'JavaScript',
        icon: SiJavascript,
        desc: "Self taught over my previous internship at Microsft",
        proficiency: "70%"

    },
    {
        _id:6,
        name: 'SQL',
        icon: BsFiletypeSql,
        desc: "Lots of work expereience with SQL, including Bigquery and Postgres. Took a Databases Class",
        proficiency: "99%"

    },
]
export const tools = [
    {
        _id:1,
        name: 'LLMs',
        icon: SiOpenai,
        desc: "Lots of experience at my previous internship with prompt engineering, agents, etc. I also enjoy using AI models in my own free time",
        proficiency: "99%"
    },
    {
        _id:2,
        name: 'React.js',
        icon: FaReact,
        desc: "This website was coded using React! Learned how to make components during my internship with Microsoft",
        proficiency: "75%"
    },
    {
        _id:3,
        name: 'Flask',
        icon: SiFlask,
        desc: "Experience with using Flask as a REST API, as well as making simple websites",
        proficiency: "90%"
    },
    {
        _id:4,
        name: 'Django',
        icon: SiDjango,
        desc: "Many of my school projects have used Django! ",
        proficiency: "88%"
        
    },
    {
        _id:5,
        name: 'Git',
        icon: FaGitAlt,
        desc: "Git for collaboration is a neccessity.",
        proficiency: "90%"
    },
    {
        _id:1,
        name: 'REST API',
        icon: TbApi,
        desc: "Implemented and utilized RESTful APIs to facilitate communication and data exchange between web applications.",
        proficiency: "90%"
    },
    {
        _id:1,
        name: 'Bigquery',
        icon: SiGooglebigquery,
        desc: "My internship with Jika.io required me to load and work with data in Bigquery",
        proficiency: "90%"
    },
    {
        _id:1,
        name: 'BI',
        icon: SiLooker,
        desc: "Researched Business intelligence tools such as Looker Studio, and how to display meaninful analytics",
        proficiency: "60%"
    },
    {
        _id:1,
        name: 'AWS',
        icon: SiLooker,
        desc: "Used AWS services like bedrock, s3, etc. during my time at Medidata. Wokring on AWS Solutions Architect Certificate",
        proficiency: "50%"
    },
    {
        _id:1,
        name: 'Python Libraries',
        icon: SiPython,
        desc: "Utilized many python libraries, such as pandas, numpy, langchain, streamlit, spaCy, etc",
        proficiency: "95%"
        
    },
    {
        _id:1,
        name: 'Docker',
        icon: FaDocker,
        desc: "Breif experience containerizing an application for deployment",
        proficiency: "30%"
    },
    
]
export const other = [
    {
        _id:1,
        name: 'Project Management',
        icon: IoIosPeople,
        desc: "As a Project manager in previous roles, it involved managing tasks, setting workloads, and resoloving conflict.",
        proficiency: "90%"
    },
    {
        _id:2,
        name: 'Teamwork',
        icon: FaPeopleCarry,
        desc: "Teamwork makes the dream work! I get energy working with other people!",
        proficiency: "99%"

    },
    {
        _id:3,
        name: 'Mentorship',
        icon: GiTeacher,
        desc: "I enjoy mentoring less experienced peers and sharing my knowledges and experiences. Held various mentorship postions in college.",
        proficiency: "90%"

    },
    {
        _id:4,
        name: 'Consulting',
        icon: BsGraphUpArrow,
        desc: "Was a Consulting Project Manager for TAMID, and won first place in a case competition! Experience with market research, outreach, etc",
        proficiency: "70%"

    },
    {
        _id:5,
        name: 'Fitness',
        icon: TbBarbell,
        desc: "I lift weights and run consistently. I also enjoy playing basketball and lacrosse.",
        proficiency: "90%"

    },
    {
        _id:6,
        name: 'Chinese',
        icon: RiTranslate,
        desc: "Experience studying and working abroad in China, fluent in Chinese",
        proficiency: "80%"

    },
]