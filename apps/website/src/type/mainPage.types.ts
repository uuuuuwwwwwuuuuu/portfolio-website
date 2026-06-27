import type { ButtonProps } from "../components/Button/Button";

export interface MainPage {
    heroSection: {
        title: string;
        description: string;
        buttons: ButtonProps[];
    };
}