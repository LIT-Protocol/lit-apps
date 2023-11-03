// @ts-nocheck

"use client";

import { useState, useEffect, useRef } from "react";
import { BrandLogo, HeroTitle, LitLoading, ThemeA } from "@getlit/ui";
import "@getlit/ui/theme.purple.css";
import { LitContractsTable } from "../components/Table";
import {
  Space,
  Container,
  Center,
  Button,
  Title,
  NativeSelect,
} from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";

const API = `${
  process.env.NEXT_PUBLIC_API ?? "http://localhost:3031"
}/contract-addresses`;

const SERRANO_API = `${
  process.env.NEXT_PUBLIC_API ?? "http://localhost:3031"
}/serrano-contract-addresses`;

const INTERNALDEV_API = `${
  process.env.NEXT_PUBLIC_API ?? "http://localhost:3031"
}/internal-dev-contract-addresses`;

const SCRIPT_REPO = `https://github.com/LIT-Protocol/getlit-contracts`;

export default function Web() {
  const [init, setInit] = useState(false);
  const [data, setData] = useState();
  const [error, setError] = useState("");
  const [network, setNetwork] = useState("Cayenne");
  const networkRef = useRef(network);

  useEffect(() => {
    networkRef.current = network;

    async function fetchData() {
      try {
        let result;
        if (network === "Cayenne") {
          result = await (await fetch(API)).json();
        } else if (network === "Serrano") {
          result = await (await fetch(SERRANO_API)).json();
        } else if (network === "internalDev") {
          result = await (await fetch(INTERNALDEV_API)).json();
        }
        setData(result.data);
        console.log("result.data:", result.data);
      } catch (e) {
        setError(`${e}`);
      }
    }

    fetchData();
  }, [network]);

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
            <Title order={2}>Quick Start</Title>
          </Center>

          <Space h="8px" />
          <div
            style={{ display: "flex", justifyContent: "center", gap: "8px" }}
          >
            <div
              style={{
                background: "grey",
                display: "flex",
                justifyContent: "center",
                paddingLeft: "12px",

                borderRadius: "4px",
                fontSize: "0.75rem",
              }}
            >
              <span style={{ margin: "auto", paddingRight: "8px" }}>NPX</span>
              <Button
                style={{ width: "100%" }}
                component="a"
                variant="gradient"
                gradient={{ from: "#0A142D", to: "#0A142D", deg: 35 }}
                href={SCRIPT_REPO}
                target="_blank"
                radius={4}
                leftIcon={<IconExternalLink size="0.9rem" />}
              >
                {/* {SCRIPT_REPO} */}
                npx @getlit/contracts
              </Button>
            </div>
          </div>

          <Space h="8px" />
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
                href={
                  network === "Cayenne"
                    ? API
                    : network === "Serrano"
                    ? SERRANO_API
                    : INTERNALDEV_API
                }
                target="_blank"
                radius={4}
                leftIcon={<IconExternalLink size="0.9rem" />}
              >
                {network === "Cayenne"
                  ? API
                  : network === "Serrano"
                  ? SERRANO_API
                  : INTERNALDEV_API}
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

                  <NativeSelect
                    value={network}
                    data={["Cayenne", "Serrano", "internalDev"]}
                    label="Network"
                    onChange={async (event) => {
                      const value = event.target.value;
                      networkRef.current = value; // Update the ref immediately

                      try {
                        let result;
                        if (networkRef.current === "Cayenne") {
                          result = await (await fetch(API)).json();
                        } else if (networkRef.current === "Serrano") {
                          result = await (await fetch(SERRANO_API)).json();
                        } else if (networkRef.current === "internalDev") {
                          result = await (await fetch(INTERNALDEV_API)).json();
                        }
                        setData(result.data);
                        console.log("result.data:", result.data);
                      } catch (e) {
                        setError(`${e}`);
                      }

                      setNetwork(value); // This will trigger a re-render, but the data is already updated
                    }}
                  />
                  <Space h="24px" />
                  {data.length <= 0 ? (
                    "No contracts found."
                  ) : (
                    <LitContractsTable key={network} data={data} />
                  )}
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
