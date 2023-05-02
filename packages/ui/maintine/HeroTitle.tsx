import {
  createStyles,
  Container,
  Text,
  Button,
  Group,
  rem,
} from "@mantine/core";
import { GithubIcon } from "@mantine/ds";

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: "relative",
    boxSizing: "border-box",
    // backgroundColor:
    //   theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
    // backgroundColor: theme.colors.dark[8],
  },

  inner: {
    position: "relative",
    paddingTop: rem(0),
    textAlign: "center",
    // paddingBottom: rem(120),

    [theme.fn.smallerThan("sm")]: {
      paddingBottom: rem(80),
      paddingTop: rem(64),
    },
  },

  title: {
    fontFamily: `Figtree, Space Grotesk, Greycliff CF, ${theme.fontFamily}`,
    fontSize: rem(48),
    fontWeight: 900,
    lineHeight: 1.1,
    margin: 0,
    padding: 0,
    // color: theme.colorScheme === "dark" ? theme.white : theme.black,
    // color: theme.black,

    [theme.fn.smallerThan("sm")]: {
      fontSize: rem(42),
      lineHeight: 1.2,
    },
  },

  description: {
    marginTop: theme.spacing.xl,
    fontSize: rem(20),

    [theme.fn.smallerThan("sm")]: {
      fontSize: rem(18),
    },
  },

  controls: {
    marginTop: `calc(${theme.spacing.xl} * 2)`,

    [theme.fn.smallerThan("sm")]: {
      marginTop: theme.spacing.xl,
    },
  },

  control: {
    height: rem(54),
    paddingLeft: rem(38),
    paddingRight: rem(38),

    [theme.fn.smallerThan("sm")]: {
      height: rem(54),
      paddingLeft: rem(18),
      paddingRight: rem(18),
      flex: 1,
    },
  },
}));

export function HeroTitle({
  titleLeft,
  titleFocus,
  titleRight,
  text,
}: {
  titleLeft: string;
  titleFocus: string;
  titleRight: string;
  text: string;
}) {
  const { classes } = useStyles();

  return (
    <div className={classes.wrapper}>
      <Container size={700} className={classes.inner}>
        <h1 className={classes.title}>
          {titleLeft}{" "}
          <Text
            component="span"
            variant="gradient"
            gradient={{ from: "#FF9F6D", to: "#EF5D34" }}
            inherit
          >
            {titleFocus}
          </Text>{" "}
          {titleRight}
        </h1>

        <Text className={classes.description} color="dimmed">
          {text}
        </Text>
{/* 
        <Group className={classes.controls}>
          <Button
            size="xl"
            className={classes.control}
            variant="gradient"
            gradient={{ from: "#FF9F6D", to: "#EF5D34" }}
          >
            Get started
          </Button>

          <Button
            component="a"
            href="https://github.com/mantinedev/mantine"
            size="xl"
            variant="default"
            className={classes.control}
            leftIcon={<GithubIcon size={20} />}
          >
            GitHub
          </Button>
        </Group> */}
      </Container>
    </div>
  );
}
