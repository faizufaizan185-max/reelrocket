const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

async function loadFFmpeg() {
  if (!ffmpeg.isLoaded()) await ffmpeg.load();
  console.log("FFmpeg ready!");
}
loadFFmpeg();

const uploadBtn = document.getElementById("uploadBtn");
const player = document.getElementById("player");

uploadBtn.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "video/*";

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    player.src = URL.createObjectURL(file);

    await loadFFmpeg();
    const data = await fetchFile(file);
    ffmpeg.FS("writeFile", file.name, data);

    console.log("Video ready!");
    await generateHighlights(file.name);
  };
  input.click();
});

async function generateHighlights(fileName) {
  const highlights = [
    { start:0, duration:5 },
    { start:10, duration:5 },
    { start:20, duration:5 }
  ];

  document.getElementById("downloadSection").innerHTML = "";

  for(let i=0;i<highlights.length;i++){
    const clip = highlights[i];
    const outFile = `highlight_${i+1}.mp4`;

    await ffmpeg.run(
      "-i", fileName,
      "-ss", clip.start.toString(),
      "-t", clip.duration.toString(),
      "-c", "copy",
      outFile
    );

    const data = ffmpeg.FS("readFile", outFile);
    const url = URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));

    // Preview
    const preview = document.createElement("video");
    preview.src = url;
    preview.controls = true;
    preview.width = 300;
    preview.style.margin = "10px";
    document.body.appendChild(preview);

    // Download
    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = `Download Highlight ${i+1}`;
    downloadBtn.onclick = () => {
      const a = document.createElement("a");
      a.href = url;
      a.download = outFile;
      a.click();
    };
    document.getElementById("downloadSection").appendChild(downloadBtn);
  }

  console.log("Highlights generated!");
  }
