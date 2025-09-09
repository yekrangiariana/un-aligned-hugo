/**
 * Current Gordian Issue Display Logic
 * Shows the current issue section only within 7 days from publication
 */
document.addEventListener("DOMContentLoaded", function () {
  // Find the current Gordian issue section
  const currentGordianSection = document.getElementById("current-gordian");

  // If the section exists, check its publication date
  if (currentGordianSection) {
    const issueCard = currentGordianSection.querySelector(
      ".gordian-issue-card"
    );

    if (issueCard) {
      const publishDateAttr = issueCard.getAttribute("data-publish-date");

      if (publishDateAttr) {
        const publishDate = new Date(publishDateAttr);
        const currentDate = new Date();

        // Calculate difference in days
        const diffTime = currentDate - publishDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Show only if within 7 days of publication
        if (diffDays <= 7) {
          currentGordianSection.style.display = "block";
          console.log(
            "Current Gordian issue displayed - published " +
              diffDays +
              " days ago"
          );
        } else {
          console.log(
            "Current Gordian issue hidden - published " + diffDays + " days ago"
          );
        }
      }
    }
  }
});
