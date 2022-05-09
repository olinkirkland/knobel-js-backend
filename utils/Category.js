function getCategoryID(category) {
  switch (category) {
    case "General Knowledge":
      return "9";
    case "Books":
      return "10";
    case "Film":
      return "11";
    case "Music":
      return "12";
    case "Musicals & Theatres":
      return "13";
    case "TV":
      return "14";
    case "Video Games":
      return "15";
    case "Board Games":
      return "16";
    case "Science & Nature":
      return "17";
    case "Computers":
      return "18";
    case "Mathematics":
      return "19";
    case "Mythology":
      return "20";
    case "Sports":
      return "21";
    case "Geography":
      return "22";
    case "History":
      return "23";
    case "Politics":
      return "24";
    case "Art":
      return "25";
    case "Celebrities":
      return "26";
    case "Animals":
      return "27";
    case "Vehicles":
      return "28";
    case "Comics":
      return "29";
    case "Gadgets":
      return "30";
    case "Anime & Manga":
      return "31";
    case "Cartoon & Animations":
      return "32";
    default:
      return "9";
  }
}

module.exports = { getCategoryID };
