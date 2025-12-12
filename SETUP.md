# ComfyUI Integration Setup

This guide will help you connect your PDF parser to your ComfyUI workflow.

## Step 1: Export Your ComfyUI Workflow

1. Open your ComfyUI interface
2. Load the workflow you want to use
3. Click the **Settings** icon (gear icon) in the top right
4. Enable **Dev mode**
5. Click **Save (API Format)** button
6. Save the JSON file

## Step 2: Update the Workflow Configuration

1. Open the saved workflow JSON file
2. Find the node that contains your primitive string input (the one with the placeholder text)
3. Note the node ID (it's the number key in the JSON, like "3", "5", etc.)
4. Open `comfy-workflow.json` in this project
5. Replace the entire contents with your workflow structure, but change the text input to use `PLACEHOLDER_TEXT`

Example:
```json
{
  "workflow": {
    "3": {
      "inputs": {
        "text": "PLACEHOLDER_TEXT"
      },
      "class_type": "PrimitiveNode"
    },
    "5": {
      "inputs": {
        "text": ["3", 0]
      },
      "class_type": "ShowText"
    }
  },
  "outputNodeId": "5"
}
```

## Step 3: Configure ComfyUI Port (if needed)

The default ComfyUI port is **8188**. If you're using a different port:

1. Create a `.env.local` file in the project root
2. Add the following line:
```
COMFY_URL=http://127.0.0.1:YOUR_PORT
```

For example, if you're using port 8000:
```
COMFY_URL=http://127.0.0.1:8000
```

## Step 4: Run the Application

1. Make sure ComfyUI is running
2. Start the Next.js dev server:
```bash
npm run dev
```
3. Open http://localhost:3000
4. Upload a PDF file
5. Click the Upload button
6. The app will:
   - Extract text from the PDF
   - Send it to your ComfyUI workflow
   - Display the result in the Output section

## Troubleshooting

### "Failed to process PDF"
- Make sure you're uploading a valid PDF file
- Check the browser console for detailed errors

### "ComfyUI returned 400/500"
- Verify ComfyUI is running
- Check the port number matches
- Make sure your workflow is valid
- Check ComfyUI's console for errors

### "Timeout waiting for ComfyUI"
- Your workflow might be taking longer than 30 seconds
- Check if ComfyUI is processing the request
- You can increase the timeout in `app/api/parse/route.js` by changing `maxAttempts` in the `pollForCompletion` function

## Getting Your Workflow Node IDs

To find the correct node IDs in your exported workflow:

1. Open the API format JSON file
2. Look for the structure - each node has a number as its key
3. Find your text input node (usually has `class_type: "PrimitiveNode"`)
4. Find your output/preview node (might be `ShowText`, `PreviewTextNode`, etc.)
5. Update `comfy-workflow.json` accordingly
