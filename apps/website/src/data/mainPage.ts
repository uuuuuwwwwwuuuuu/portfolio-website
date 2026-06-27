import type { MainPage } from "../type/mainPage.types";

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
            }
        ],
	},
};

export default mainPage;
