import {TodoItem} from "../models/TodoItem";
import {ToDoAccess} from "../dataLayer/ToDoAccess";
import {parseUserId} from "../auth/utils";
import {CreateTodoRequest} from "../requests/CreateTodoRequest";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import {TodoUpdate} from "../models/TodoUpdate";

const uuidV4 = require('uuid/v4');
const toDoAccess = new ToDoAccess();
const todosTable = process.env.TODOS_TABLE;
const s3BucketName = process.env.S3_BUCKET_NAME;
export async function getAllToDo(jwtToken: string): Promise<TodoItem[]> {
    const userId = parseUserId(jwtToken);
    return toDoAccess.getAllToDo(userId);
}

export async function createToDo(createTodoRequest: CreateTodoRequest, jwtToken: string): Promise<TodoItem> {
    const userId = parseUserId(jwtToken)
    const todoId = uuidV4()
    const attachmentUrl = `https://${s3BucketName}.s3.amazonaws.com/${todoId}`
    return await toDoAccess.createToDo({
        userId: userId,
        todoId: todoId,
        createdAt: new Date().getTime().toString(),
        done: false,
        attachmentUrl: attachmentUrl,
        ...createTodoRequest,
    });
}

export function updateToDo(updateTodoRequest: UpdateTodoRequest, todoId: string, jwtToken: string): Promise<TodoUpdate> {
    const userId = parseUserId(jwtToken);
    return toDoAccess.updateToDo(updateTodoRequest, todoId, userId);
}

export function deleteToDo(todoId: string, jwtToken: string): Promise<string> {
    const userId = parseUserId(jwtToken);
    return toDoAccess.deleteToDo(todoId, userId);
}

export async function generateUploadUrl(todoId: string) {
    const {uploadUrl,attachmentUrl} =  await toDoAccess.generateUploadUrl(todoId);
    return {
        uploadUrl
        ,attachmentUrl
    }
}

export async function updateTodoUploadUrl(
    todoId: string,
    attachmentUrl: string,
    jwtToken: string
  ) {
    const userId = parseUserId(jwtToken);
    const updatedTodoItem = {
      TableName: todosTable,
      Key: {
        "userId": userId,
        "todoId": todoId
      },
      UpdateExpression: 'set attachmentUrl=:a',
      ExpressionAttributeValues: {
        ':a': attachmentUrl
      },
      ReturnValues: 'UPDATED_NEW'
    }
    console.log('updating TodoItem', updatedTodoItem)
  
    return await toDoAccess.updateTodoItem(updatedTodoItem)
  }
  