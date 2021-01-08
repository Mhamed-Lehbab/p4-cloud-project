import { TodoItem } from "../models/TodoItem";
import { ToDoAccess } from "../dataLayer/ToDoAccess";
import { parseUserId } from "../auth/utils";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import { TodoUpdate } from "../models/TodoUpdate";

const uuidV4 = require('uuid/v4');
const toDoAccess = new ToDoAccess();

//
export async function getAllToDo(jwtToken: string): Promise<TodoItem[]> {
  const userId = parseUserId(jwtToken);
  return toDoAccess.getAllToDo(userId);
}

//
export async function createToDo(createTodoRequest: CreateTodoRequest, jwtToken: string): Promise<TodoItem> {
  const todoId = uuidV4()
  const userId = parseUserId(jwtToken)

  ///attachmentUrl is now a component of dataLayer
  const attchUrl = ToDoAccess.attachmentUrl + todoId

  return await toDoAccess.createToDo({
    userId: userId,
    todoId: todoId,
    createdAt: new Date().getTime().toString(),
    done: false,
    attachmentUrl: attchUrl,
    ...createTodoRequest,
  });
}

//
export function updateToDo(updateTodoRequest: UpdateTodoRequest, todoId: string, jwtToken: string): Promise<TodoUpdate> {
  const userId = parseUserId(jwtToken);
  return toDoAccess.updateToDo(updateTodoRequest, todoId, userId);
}

//
export function deleteToDo(todoId: string, jwtToken: string): Promise<string> {
  const userId = parseUserId(jwtToken);
  return toDoAccess.deleteToDo(todoId, userId);
}

//
export async function generateUploadUrl(todoId: string) {
  const { uploadUrl, attachmentUrl } = await toDoAccess.generateUploadUrl(todoId);
  return {
    uploadUrl
    , attachmentUrl
  }
}

//
export async function updateTodoUploadUrl(
  todoId: string,
  attachmentUrl: string,
  jwtToken: string
) {
  
  const userId = parseUserId(jwtToken);
  await toDoAccess.updateTodoItem(userId, todoId, attachmentUrl)
}
