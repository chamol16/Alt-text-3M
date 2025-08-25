document.addEventListener('DOMContentLoaded', (event) => {
  const imageUpload = document.getElementById('imageUpload');
  const outputContainer = document.getElementById('outputContainer');

  imageUpload.addEventListener('change', function (event) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      outputContainer.innerHTML = '<p>Generating alt text...</p>';

      reader.onload = function (e) {
        const imageDataUrl = e.target.result;

        chrome.runtime.sendMessage({
          type: "generateAltText",
          prompt: 'Provide a concise, SEO-optimized description of this image in English, Spanish, Canadian French, and Portuguese. Format the response as a list with the language name as the heading for each description. Do not include the word "image" in any of the descriptions.',
          mimeType: file.type,
          imageData: imageDataUrl.split(',')[1]
        }, (response) => {
          if (response.success) {
            const data = response.data;
            outputContainer.innerHTML = '';

            if (data.candidates && data.candidates[0].content.parts.length > 0) {
              const combinedText = data.candidates[0].content.parts[0].text;
              const descriptions = combinedText.split(/\* \*\*([A-Za-z ]+):\*\*/).filter(Boolean);

              if (descriptions.length > 0) {
                for (let i = 1; i < descriptions.length; i += 2) {
                  const language = descriptions[i].trim();
                  const descriptionText = descriptions[i + 1].trim();

                  const heading = document.createElement('h3');
                  heading.textContent = language;
                  outputContainer.appendChild(heading);

                  const paragraph = document.createElement('p');
                  paragraph.textContent = descriptionText;
                  outputContainer.appendChild(paragraph);
                }
              } else {
                outputContainer.innerHTML = '<p>The API response was empty or malformed. Please try a different image.</p>';
              }
            } else {
              outputContainer.innerHTML = '<p>Could not generate alt text. Please try again.</p>';
            }
          } else {
            console.error('Error processing the image:', response.error);
            outputContainer.innerHTML = `<p>An error occurred while processing the image: ${response.error}</p>`;
          }
        });
      };

      reader.readAsDataURL(file);

    } else {
      outputContainer.innerHTML = '<p>Please select an image.</p>';
    }
  });
});