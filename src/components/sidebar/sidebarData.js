import { FaRegFileLines, FaUserDoctor } from "react-icons/fa6";
import { PiTextAlignLeftBold } from "react-icons/pi";
import { TbUserQuestion } from "react-icons/tb";
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";
import { LuFileCheck2 } from "react-icons/lu";
import { AiOutlineRobot } from "react-icons/ai";


export const navItems = [
    {
        href: "/info-about-specific-disease",
        label: "Specific Disease Details",
        icon: <FaUserDoctor size={20} />,
    },
]


export const navItems1 = [
   
    // {
    //     href: "/generate-initial-questions",
    //     label: "Generate Follow-Up Questions",
    //     icon: <TbUserQuestion size={20} />,
    // },
    // {
    //     href: "/generate-assessment-questions",
    //     label: "Generate Assessment Questions",
    //     icon: <MdOutlineAssignmentTurnedIn size={20} />,
    // },

     {
        href: "/generate-medical-summary",
        label: "Generate Medical Summary",
        icon: <PiTextAlignLeftBold size={20} />,
    },

];

export const navItems2 = [
    {
        href: "/analyze-disease",
        label: "Analyze Possible Disease",
        icon: <FaRegFileLines size={20} />,
    },
    // {
    //     href: "/report-analysis",
    //     label: "Report Analysis",
    //     icon: <LuFileCheck2 size={20} />,
    // },
    {
        href: "/ai-report-analysis",
        label: "AI Diagnostic Report Analysis",
        icon: <AiOutlineRobot size={20} />,
    },
]