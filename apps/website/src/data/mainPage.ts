import type { MainPage } from "../type/mainPage.types";
import AboutMeImage from '@assets/AboutMeImage.webp'

const mainPage: MainPage = {
	heroSection: {
		title: 'LETS <span class="accent-color">BUILD</span> SOMETHING <span class="accent-color">MORE</span> THEN APP',
		description:
			"I'm Denis, a Frontend Developer turning ideas into products from high-performance Astro websites to cross-platform React & React Native applications.",
		buttons: [
			{
				variant: 'primaryFilled',
				children: 'Read More',
			},
			{
				variant: 'secondaryOutlined',
				children: 'Get in touch',
			},
		],
	},
	aboutMeSection: {
		title: '<span class="accent-color">About</span> Me',
		image: AboutMeImage,
		subtitle: "Hi, I'm Denis, a Frontend Developer from Belarus",
		description: `I started programming when I was 16. I began my journey with game development, but I quickly realized that it wasn't the right fit for me. However, my desire to write code didn't go away.<br /><br />Later, I decided to try building Telegram bots with Python. While exploring this topic, I came across Web Apps integrated into Telegram bots. At that exact moment, I realized: 'This is what I want to learn...'<br /><br />That is how I started getting into the world of web development. I learned everything on my own. Naturally, I started with the basics—HTML and CSS—using YouTube tutorials and documentation. After that, I moved on to JavaScript, taking courses by Ivan Petrichenko.<br /><br />Then, I joined RS School. I completed Stage 1 and decided to leave because I wanted to move forward faster and study React along with TypeScript.<br /><br />I learned React mostly through documentation, Stack Overflow, and pure trial and error. I was immediately building my own project—a music streaming service—without any state manager. I soon realized that wasn't the right way to do things, so I learned my first state manager, Redux (and later RTK).<br /><br />Currently, I am working at Webbee GmbH as a Junior Frontend Developer. At the same time, I work on my own side projects, improve my skills, and expand my tech stack.`,
	},
};

export default mainPage;
