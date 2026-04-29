//array of 20 verified posts

const demoPosts = [
  {
    imageUrl:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=60",
    caption: "Morning walk energy is unmatched.",
    petType: "dog",
    authorUsername: "miloandme",
    likesCount: 18,
    likedBy: ["anna", "rhea", "jason", "kelly"],
    savedBy: ["anna", "kelly"],
    comments: [
      { username: "anna", text: "Such a happy face 🥹" },
      { username: "rhea", text: "So cute omg" },
    ],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=60",
    caption: "He found a stick. Life is complete.",
    petType: "dog",
    authorUsername: "pawthteam",
    likesCount: 45,
    likedBy: ["nina", "dev", "sam", "jo"],
    savedBy: ["sam", "jo"],
    comments: [
      { username: "nina", text: "Model material" },
      { username: "sam", text: "That smile 😭" },
    ],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=800&q=60",
    caption: "Caught mid-run at the park 🌿",
    petType: "dog",
    authorUsername: "bentleydays",
    likesCount: 23,
    likedBy: ["lisa", "mark", "tina"],
    savedBy: ["tina"],
    comments: [{ username: "lisa", text: "So much energy!" }],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=60",
    caption: "Fresh groom and very proud of it.",
    petType: "dog",
    authorUsername: "cocojournals",
    likesCount: 36,
    likedBy: ["ella", "kai", "noah"],
    savedBy: ["ella"],
    comments: [
      { username: "ella", text: "So fluffy!" },
      { username: "kai", text: "This is too cute" },
    ],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=800&q=60",
    caption: "The park? His office.",
    petType: "dog",
    authorUsername: "dailypaws",
    likesCount: 11,
    likedBy: ["maya", "zoe"],
    savedBy: ["maya"],
    comments: [],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=60",
    caption: "Sunbathing is a serious sport.",
    petType: "dog",
    authorUsername: "sunsetpets",
    likesCount: 29,
    likedBy: ["mira", "alex", "cole"],
    savedBy: ["alex"],
    comments: [{ username: "mira", text: "Living the dream" }],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=800&q=60",
    caption: "New collar drop. He knows.",
    petType: "dog",
    authorUsername: "morningpaws",
    likesCount: 14,
    likedBy: ["jade", "ren"],
    savedBy: [],
    comments: [{ username: "jade", text: "Serving looks 😤" }],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=60",
    caption: "Professional napper. Full-time job.",
    petType: "cat",
    authorUsername: "whiskerdiary",
    likesCount: 32,
    likedBy: ["mira", "alex", "sana"],
    savedBy: ["mira"],
    comments: [{ username: "alex", text: "Honestly same" }],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=800&q=60",
    caption: "New toy. Zero peace since then.",
    petType: "cat",
    authorUsername: "lunalogs",
    likesCount: 14,
    likedBy: ["eva", "kai"],
    savedBy: [],
    comments: [{ username: "eva", text: "This is adorable" }],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=60",
    caption: "Window seat claimed for the whole afternoon.",
    petType: "cat",
    authorUsername: "olivewhiskers",
    likesCount: 27,
    likedBy: ["sara", "jen"],
    savedBy: [],
    comments: [{ username: "jen", text: "The lighting is perfect" }],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=800&q=60",
    caption: "Mood: do not disturb unless snacks are involved.",
    petType: "cat",
    authorUsername: "mochamews",
    likesCount: 19,
    likedBy: ["ava", "leo"],
    savedBy: [],
    comments: [{ username: "leo", text: "Very relatable" }],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=800&q=60",
    caption: "Judging you silently from across the room.",
    petType: "cat",
    authorUsername: "fluffyfiles",
    likesCount: 41,
    likedBy: ["anna", "mika", "ivy", "dev"],
    savedBy: ["anna", "ivy"],
    comments: [{ username: "mika", text: "The stare 😂" }],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=800&q=60",
    caption: "Found the one warm spot in the house.",
    petType: "cat",
    authorUsername: "petsnaps",
    likesCount: 22,
    likedBy: ["tina", "noah", "sam"],
    savedBy: ["tina"],
    comments: [],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?auto=format&fit=crop&w=800&q=60",
    caption: "Monday face, permanently.",
    petType: "cat",
    authorUsername: "furryfeed",
    likesCount: 33,
    likedBy: ["zoe", "jo", "mark", "sara"],
    savedBy: ["jo"],
    comments: [{ username: "zoe", text: "Me every morning" }],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=800&q=60",
    caption: "Chose the box over the bed. Every time.",
    petType: "cat",
    authorUsername: "tailsandtales",
    likesCount: 17,
    likedBy: ["kelly", "ren"],
    savedBy: [],
    comments: [{ username: "kelly", text: "Classic cat behaviour" }],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=800&q=60",
    caption: "Knocked it off the counter. No regrets.",
    petType: "cat",
    authorUsername: "thepetdiaries",
    likesCount: 38,
    likedBy: ["ella", "leo", "mina", "cole"],
    savedBy: ["ella", "mina"],
    comments: [
      { username: "leo", text: "They always do this 😭" },
      { username: "cole", text: "No remorse whatsoever" },
    ],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?auto=format&fit=crop&w=800&q=60",
    caption: "Tiny bird, huge personality.",
    petType: "bird",
    authorUsername: "skybuddy",
    likesCount: 9,
    likedBy: ["zoe"],
    savedBy: [],
    comments: [],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=800&q=60",
    caption: "Little singer warming up for the day.",
    petType: "bird",
    authorUsername: "feathernotes",
    likesCount: 8,
    likedBy: ["zoe", "mika"],
    savedBy: [],
    comments: [],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=800&q=60",
    caption: "Morning concert, no tickets required.",
    petType: "bird",
    authorUsername: "smallpetclub",
    likesCount: 12,
    likedBy: ["rhea", "jason"],
    savedBy: ["rhea"],
    comments: [{ username: "jason", text: "I need this in my life" }],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1591198936750-16d8e15edb9e?auto=format&fit=crop&w=800&q=60",
    caption: "Fluffed up and fully unbothered.",
    petType: "bird",
    authorUsername: "petmomdaily",
    likesCount: 15,
    likedBy: ["ava", "ivy", "jade"],
    savedBy: ["jade"],
    comments: [{ username: "ava", text: "So round 🥺" }],
  },
];

module.exports = demoPosts;
