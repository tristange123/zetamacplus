import type { Metadata } from "next";
import LayoutClientSide from "./layoutClientSide";
import {type ReactNode} from 'react'
import { Roboto } from "next/font/google";

const roboto = Roboto({
    weight: ["400", "500", "700", "900"],
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://zetamacplus.com"),

    title: {
        default: "Zetamac+",
        template: "%s | Zetamac+",
    },

    description:
        "A upgraded version of the popular quant interview math speed game arimetic zetamac. Practice your mental math with adaptive challenges. Log in daily, track your progression and compete on the leaderboard.",
        

    // icons: {
    //     icon: "/favicon.ico",
    // },

    openGraph: {
        title: "Zetamac+",
        description: "Practice your mental math with adaptive challenges. Log in daily, track your progression and compete on the leaderboard.",
        
        // images: ["/og-image.png"],
    },

    // twitter: {
    //     card: "summary_large_image",
    //     title: "Zetamac+",
    //     description: "Practice mental math.",
    //     images: ["/og-image.png"],
    // },
};

export default function Layout({children} : {children: ReactNode}){

    return <>
        <LayoutClientSide fontClassName={roboto.className}>{children}</LayoutClientSide>
    </>
}