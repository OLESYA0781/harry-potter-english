import { jsPDF } from "jspdf";
import { diagnose } from "./data";
import { differenceSkills } from "./Differences";
import type { LessonState } from "./data";
function safeName(name: string) {
  return name.replace(/[^\x20-\x7E]/g, "").trim() || "Young wizard";
}
async function nameImage(name: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1500;
  canvas.height = 160;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#273f36";
  ctx.font = "bold 72px Georgia";
  ctx.textAlign = "center";
  ctx.fillText(name || "Young wizard", 750, 105, 1400);
  return canvas.toDataURL("image/png");
}
export async function downloadPDF(state: LessonState, certificate = false) {
  const doc = new jsPDF({
    orientation: certificate ? "landscape" : "portrait",
  });
  const w = doc.internal.pageSize.getWidth(),
    h = doc.internal.pageSize.getHeight();
  doc.setFillColor("#faf4e8");
  doc.rect(0, 0, w, h, "F");
  doc.setDrawColor("#b48c42");
  doc.setLineWidth(1);
  doc.rect(10, 10, w - 20, h - 20);
  doc.setTextColor("#273f36");
  doc.setFont("times", "bold");
  doc.setFontSize(certificate ? 31 : 23);
  doc.text(
    certificate
      ? "Certificate of English Adventure"
      : "English Adventure - lesson results",
    w / 2,
    35,
    { align: "center" },
  );
  doc.setFontSize(13);
  doc.text("Harry Potter's English Adventure", w / 2, 47, { align: "center" });
  doc.addImage(await nameImage(state.name), "PNG", w / 2 - 75, 55, 150, 16);
  doc.setFont("helvetica", "normal");
  if (certificate) {
    doc.setFontSize(17);
    doc.text("has completed a magical English adventure!", w / 2, 98, {
      align: "center",
    });
    doc.text(
      `${Object.values(state.scores).filter((s) => s.correct).length} golden stars collected`,
      w / 2,
      119,
      { align: "center" },
    );
    doc.setFontSize(12);
    doc.text(
      "Read with curiosity. Speak with courage. Keep your magic growing.",
      w / 2,
      143,
      { align: "center" },
    );
    doc.text(new Date().toLocaleDateString("en-GB"), w / 2, 170, {
      align: "center",
    });
  } else {
    const d = diagnose(state);
    doc.setFontSize(12);
    let y = 88;
    for (const m of d.metrics) {
      doc.text(
        `${m.skill}: ${m.percent === null ? "not assessed" : m.percent + "%"} (${m.done}/${m.total} assessed)`,
        22,
        y,
      );
      y += 12;
    }
    doc.text(
      `Preliminary level: ${d.level ?? "Pending complete assessment"}`,
      22,
      y + 6,
    );
    doc.setFontSize(10);
    doc.text(
      doc.splitTextToSize(
        "This is a preliminary classroom estimate, not an official language test. Automatic scores use first attempts. Later correct answers earn stars. Speaking and reading aloud are assessed by the teacher.",
        w - 44,
      ),
      22,
      y + 20,
    );
    y += 48;
    doc.text("Suggested practice:", 22, y);
    for (const m of d.metrics.filter(
      (m) => m.percent === null || m.percent < 70,
    )) {
      y += 9;
      doc.text(
        `${m.skill}: ${m.percent === null ? "complete this assessment" : "practise with short daily activities"}`,
        22,
        y,
      );
    }
    doc.text(
      `Date: ${new Date().toLocaleDateString("en-GB")} | Student: ${safeName(state.name)}`,
      22,
      h - 21,
    );
  }
  if (
    !certificate &&
    (Array.isArray(state.answers.differencesFound) ||
      differenceSkills.some(
        ([id]) => state.ratings[`difference-${id}`] !== undefined,
      ))
  ) {
    doc.addPage();
    doc.setFontSize(21);
    doc.text("Find the Differences - A2-B1 bonus", 22, 30);
    doc.setFontSize(12);
    doc.text(
      `Differences spotted: ${Array.isArray(state.answers.differencesFound) ? state.answers.differencesFound.length : 0}/5`,
      22,
      48,
    );
    differenceSkills.forEach(([id, title], i) =>
      doc.text(
        `${title}: ${state.ratings[`difference-${id}`] === undefined ? "not assessed" : ["could not answer", "with help", "independently"][state.ratings[`difference-${id}`]]}`,
        22,
        68 + i * 14,
      ),
    );
    doc.setFontSize(10);
    doc.text(
      doc.splitTextToSize(
        "This optional extension assesses oral comparisons, prepositions, there is/are and Present Continuous. It is separate from the main A1-A2 assessment and does not certify a B1 level.",
        w - 44,
      ),
      22,
      138,
    );
  }
  doc.save(
    certificate
      ? "english-adventure-certificate.pdf"
      : "english-adventure-results.pdf",
  );
}
