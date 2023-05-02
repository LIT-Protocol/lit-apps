import { useState } from "react";
import {
  BrandLogo,
  HeroTitle,
  LitButton,
  LitIcon,
  TableSort,
  ThemeA,
} from "ui";
import "ui/theme.purple.css";
import { routeData } from "../routeData";
// import "ui/utils.css";
import { Text, Space, Container, Center } from "@mantine/core";

export default function Web() {
  const [links, setLinks] = useState(routeData);

  return (
    // <div className="flex flex-col center p-12">
    //   <h1 className="mt-12 mb-12">Lit Demo Apps</h1>

    //   <ul className="flex flex-col gap-8 pt-24">
    //     {links.map((link, index) => (
    //       <li key={index} className="m-auto">
    //         <LitButton className="lit-button-2" href={link.path}>
    //           {link.name}
    //         </LitButton>
    //       </li>
    //     ))}
    //   </ul>
    // </div>
    <>
      <ThemeA className="app" data-lit-theme="purple">
        <Center maw={400} h={100} my={48} mx="auto">
          <BrandLogo type={2} width={120} height={120} />
        </Center>

        <HeroTitle
          titleLeft="Top"
          titleFocus="Lit Protocol"
          titleRight="Demo Apps To Try Now!"
          text="Discover the cutting-edge technology of Lit Protocol and gain
          inspiration for your own app development journey with these top demos."
        />
        <Space h="xl" />
        <Space h="xl" />

        <Container size="md">
          <TableSort data={routeData} />
        </Container>
      </ThemeA>
    </>
  );
}
