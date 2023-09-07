"use client";

import { useState, useEffect } from "react";
import { BrandLogo, HeroTitle, LitLoading, ThemeA } from "@getlit/ui";
import "@getlit/ui/theme.purple.css";
import { LitContractsTable } from "./Table";
import { Space, Container, Center, Button, Title } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
const API = `${
  process.env.NEXT_PUBLIC_API ?? "http://localhost:3031"
}/contract-addresses`;

export default function Web() {
  const [data, setData] = useState();
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await (await fetch(API)).json();

        setData(result.data);

        console.log(result.data);
      } catch (e) {
        setError(`${e}`);
      }
    }

    if (!data) {
      fetchData();
    }
  });

  return (
    <div>
      <ThemeA className="app" data-lit-theme="purple">
        <Center maw={400} h={100} my={48} mx="auto">
          <BrandLogo type={2} width={120} height={120} />
        </Center>

        <HeroTitle titleFocus="Lit Protocol" titleRight="Contracts" />

        <Container size="md">
          {/* <LitButton onClick={handleClick}>Fetch Test</LitButton> */}

          <Center>
            <Title order={2}>API</Title>
          </Center>
          <Space h="4px" />

          <div
            style={{ display: "flex", justifyContent: "center", gap: "8px" }}
          >
            <div
              style={{
                background: "green",
                display: "flex",
                justifyContent: "center",
                paddingLeft: "12px",

                borderRadius: "4px",
                fontSize: "0.75rem",
              }}
            >
              <span style={{ margin: "auto", paddingRight: "8px" }}>GET</span>
              <Button
                style={{ width: "100%" }}
                component="a"
                variant="gradient"
                gradient={{ from: "#0A142D", to: "#0A142D", deg: 35 }}
                href={API}
                target="_blank"
                radius={4}
                leftIcon={<IconExternalLink size="0.9rem" />}
              >
                {API}
              </Button>
            </div>
          </div>

          {error !== "" ? (
            <>
              <Space h="xl" />
              <Center>
                {error && <div style={{ color: "red" }}>{error}</div>}{" "}
                <Space h="xl" />
              </Center>
            </>
          ) : (
            <>
              <Space h="xl" />
              {/* -- success -- */}
              {!data ? (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <LitLoading
                    icon="lit-logo"
                    text="Getting latest contracts..."
                  />
                </div>
              ) : (
                <>
                  <Center>
                    <Title order={2}>Latest Contracts</Title>
                  </Center>
                  <Space h="4px" />
                  <LitContractsTable data={data} />
                </>
              )}
            </>
          )}
        </Container>

        <Space h="xl" />
        <Space h="xl" />
        <Space h="xl" />
      </ThemeA>
    </div>
  );
}
