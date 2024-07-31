export default function () {
  let operations = {
    GET,
  };

  function GET(req, res) {
    const submission = {
      id: req.params.id,
      submission: "My form response",
    };
    res.status(200).json(submission);
  }

  GET.apiDoc = {
    summary:
      "Retrieves the oldest submission with status ‘new’ and modifies status to ‘downloaded’",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: {
          type: "string",
        },
      },
    ],
    responses: {
      200: {
        description: "Form submission",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Submission",
            },
          },
        },
      },
    },
  };

  return operations;
}
