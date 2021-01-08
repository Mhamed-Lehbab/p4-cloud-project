import * as AWS from "aws-sdk";
import * as AWSXray from "aws-xray-sdk";

import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Types } from 'aws-sdk/clients/s3';
import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from "../models/TodoUpdate";


const XAWS = AWSXray.captureAWS(AWS);

export class ToDoAccess {
    static s3BucketName: any = process.env.S3_BUCKET_NAME;
    static todosTable = process.env.TODOS_TABLE;
    static attachmentUrl = `https://${ToDoAccess.s3BucketName}.s3.amazonaws.com/`

    constructor(

        //CHANGED AS REQUIRED.
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),

        private readonly s3Client: Types = new AWS.S3({ signatureVersion: 'v4' }),
        private readonly todoTable = process.env.TODOS_TABLE,
        private readonly s3BucketName = process.env.S3_BUCKET_NAME) {
    }


    //
    async getAllToDo(userId: string): Promise<TodoItem[]> {
        console.log("Getting all todo");

        const params = {
            TableName: this.todoTable,
            KeyConditionExpression: "#userId = :userId",
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            ExpressionAttributeValues: {
                ":userId": userId
            }
        };

        const result = await this.docClient.query(params).promise();
        console.log(result);
        const items = result.Items;

        return items as TodoItem[]
    }

    //
    async createToDo(todoItem: TodoItem): Promise<TodoItem> {
        console.log("Creating new todo");
        const params = {
            TableName: this.todoTable,
            Item: todoItem,
        };

        const result = await this.docClient.put(params).promise();
        console.log(result);

        return todoItem as TodoItem;
    }

    //
    async updateToDo(todoUpdate: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate> {
        console.log("Updating todo");

        const result = await this.docClient.update(
            {
                TableName: this.todoTable,
                Key: {
                    "userId": userId,
                    "todoId": todoId
                },
                UpdateExpression: "set #a = :a, #b = :b, #c = :c",
                ExpressionAttributeNames: {
                    "#a": "name",
                    "#b": "dueDate",
                    "#c": "done",
                },
                ExpressionAttributeValues: {
                    ":a": "testname",
                    ":b": "testdata",
                    ":c": true,
                },
                ReturnValues: "ALL_NEW"
            }, function (err, data) {
                if (err) console.log(err);
                else console.log(data);
            }
        ).promise();
        todoUpdate['name'] = "zaki";
        const attributes = result.Attributes;

        return attributes as TodoUpdate;
    }

    //
    async deleteToDo(todoId: string, userId: string): Promise<string> {
        console.log("Deleting todo");

        const params = {
            TableName: this.todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
        };

        const result = await this.docClient.delete(params).promise();
        console.log(result);

        return "" as string;
    }

    //
    async generateUploadUrl(todoId: string) {
        console.log("Generating URL");

        const uploadUrl = this.s3Client.getSignedUrl('putObject', {
            Bucket: this.s3BucketName,
            Key: todoId,
            Expires: 1000,
        });
        const attachmentUrl = `https://${this.s3BucketName}.s3.amazonaws.com/${todoId}`
        console.log(uploadUrl);
        return {
            uploadUrl,
            attachmentUrl
        }
    }

    //
    async updateTodoItem(userId, todoId, attachmentUrl) {

        const updatedTodoItem = {

            ///todoTable is now a component of dataLayer
            TableName: ToDoAccess.todosTable,
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
        return this.docClient.update(updatedTodoItem).promise()
    }

}