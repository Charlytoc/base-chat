export const API_URL =
  // @ts-ignore
  import.meta.env.VITE_API_URL || "http://localhost:8000";
export const STREAMING_BACKEND_URL = window.location.origin;

export const PUBLIC_TOKEN =
  // @ts-ignore
  import.meta.env.VITE_PUBLIC_TOKEN || "39ece367b84b4bd19622692cc70361f2";

export function getRandomWordsAndSlug() {
  const randomWords = [
    "apple",
    "banana",
    "cherry",
    "date",
    "elderberry",
    "fig",
    "grape",
    "honeydew",
    "kiwi",
    "lemon",
    "mango",
    "nectarine",
    "orange",
    "papaya",
    "quince",
    "raspberry",
    "strawberry",
    "tangerine",
    "ugli",
    "vanilla",
    "watermelon",
    "xigua",
    "yam",
    "zucchini",
    "avocado",
    "blueberry",
    "cantaloupe",
    "dragonfruit",
    "eggplant",
    "fennel",
    "guava",
    "huckleberry",
    "jackfruit",
    "kumquat",
    "lime",
    "mulberry",
    "olive",
    "peach",
    "plum",
    "starfruit",
  ];

  // Shuffle the array and select the first three words
  const selectedWords = randomWords.sort(() => 0.5 - Math.random()).slice(0, 3);

  // Create a slugified version by joining the words with hyphens
  const slug = selectedWords.join("-").toLowerCase();

  return {
    name: selectedWords.join(" "),
    slug: slug,
  };
}
