import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { generateUploadUrl} from '../../businessLogic/toDo';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  console.log("Processing Event ", event);


  const {uploadUrl,attachmentUrl} = await generateUploadUrl(todoId)
  
 

  return {
      statusCode: 201,
      headers: {
          "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
          uploadUrl: uploadUrl,
          result : attachmentUrl
      })
  }
}
