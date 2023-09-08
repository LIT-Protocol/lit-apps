import { useEffect, useState } from "react";
import {
  createStyles,
  Table,
  ScrollArea,
  UnstyledButton,
  Group,
  Text,
  Center,
  rem,
  Button,
} from "@mantine/core";
import { keys } from "@mantine/utils";
import {
  IconSelector,
  IconChevronDown,
  IconChevronUp,
  IconSearch,
  IconExternalLink,
} from "@tabler/icons-react";

const useStyles = createStyles((theme) => ({
  th: {
    padding: "0 !important",
  },

  td: {
    color: "white",
  },

  control: {
    width: "100%",
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
  },

  icon: {
    width: rem(21),
    height: rem(21),
    borderRadius: rem(21),
  },
}));

function Th({ style, children, reversed, sorted, onSort }) {
  const { classes } = useStyles();
  const Icon = sorted
    ? reversed
      ? IconChevronUp
      : IconChevronDown
    : IconSelector;
  return (
    <th className={`${classes.th}`} style={style}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group position="apart">
          <Text fw={500} fz="sm" color="#7F53AD">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon size="0.9rem" stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </th>
  );
}

function filterData(data, search) {
  const query = search.toLowerCase().trim();
  return data.filter((item) =>
    keys(data[0]).some((key) => item[key].toLowerCase().includes(query))
  );
}

function sortData(data, payload) {
  const { sortBy } = payload;

  if (!sortBy) {
    return filterData(data, payload.search);
  }

  return filterData(
    [...data].sort((a, b) => {
      if (payload.reversed) {
        return b[sortBy].localeCompare(a[sortBy]);
      }

      return a[sortBy].localeCompare(b[sortBy]);
    }),
    payload.search
  );
}

function Td({ children, style }) {
  const { classes } = useStyles();

  return (
    <td className={classes.td} style={style}>
      {children}
    </td>
  );
}

export function LitContractsTable({ data }) {
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState(data);
  const [sortBy, setSortBy] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const setSorting = (field) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(data, { sortBy: field, reversed, search }));
  };

  const rows = sortedData.map((row) => {
    const date = new Date(row.contracts[0]["inserted_at"]);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString(
      "en-US",
      { hour12: false }
    )}`;
    const contractAddress = row.contracts[0]["address_hash"];
    const contractLink =
      "https://chain.litprotocol.com/address/" + contractAddress;

    return (
      <tr key={row.name}>
        <Td>{row.name}</Td>
        <Td>{formattedDate}</Td>
        <Td>
          <Button
            style={{ width: "100%" }}
            component="a"
            variant="gradient"
            gradient={{ from: "#0A142D", to: "#0A142D", deg: 35 }}
            href={contractLink}
            target="_blank"
            radius={12}
            leftIcon={<IconExternalLink size="0.9rem" />}
          >
            {contractAddress}
          </Button>
        </Td>
      </tr>
    );
  });

  return (
    <ScrollArea>
      <Table
        horizontalSpacing="md"
        verticalSpacing="xs"
        miw={700}
        sx={{ tableLayout: "fixed" }}
      >
        <thead>
          <tr>
            <Th
              style={{ width: "230px" }}
              sorted={sortBy === "name"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("name")}
            >
              Name
            </Th>
            <Th
              sorted={sortBy === "date"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("date")}
            >
              Deploy Date
            </Th>
            <Th
              style={{ width: "460px" }}
              sorted={sortBy === "address"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("address")}
            >
              Contract Address
            </Th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <tr>
              <td colSpan={Object.keys(data[0]).length}>
                <Text weight={500} align="center">
                  Nothing found
                </Text>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </ScrollArea>
  );
}
