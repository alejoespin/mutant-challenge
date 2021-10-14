# Mutation Challenge

Desarrollo de challenge mutantes.

Los servicios desarrollados nos permiten verificar si el *ADN* enviado es o no mutante y realizar una consulta estadistica de las peticiones realizadas.

Desarrollados en ***NodeJS***, diseñados para el despliegue en ***AWS-Lambda***, con persistencia en ***AWS-DynamoDB*** y haciendo uso de ***CloudFormation*** para la creación de la infraestructura necesaria.

* [POST:/mutant](#postmutant)
* [GET:/stats](#getstats)
* [URL's](#urls)
* [Testing](#testing)
* [How to deploy](#how-to-deploy)
* [AWS URL's](#aws-urls)
* [Test Environment](#test-environment)

## ***POST:/mutant***
### Request

El servicio de verificación de ADN requiere un **JSON** con la siguiente estructura

```js
{
    "dna": [
        "ATGCTA",
        "ACGCGC",
        "ACTAGT",
        "AACGAT",
        "CAACTA",
        "ACACTC"
    ]
}
```

### Response

### Respuesta al identificar un **mutante**

```js
HTTP/Status: 200
```

#### Ejemplo

```sh
curl --location -v --request POST 'https://{API-GATEWAY-URL}/challenge/mutant' \
--header 'Content-Type: application/json' \
--data-raw '{
    "dna": [
        "ATGCAA",
        "ACGCGC",
        "ACTAGT",
        "AAGGAT",
        "CAACTA",
        "ACACTC"
    ]
}'
```
```sh
> POST /challenge/mutant HTTP/2
> Host: 7fu651tpac.execute-api.us-west-2.amazonaws.com
> User-Agent: curl/7.64.1
> Accept: */*
> Content-Type: application/json
> Content-Length: 129
> 
* Connection state changed (MAX_CONCURRENT_STREAMS == 128)!
* We are completely uploaded and fine
< HTTP/2 200
< date: Wed, 13 Oct 2021 17:14:41 GMT
< content-type: application/json
< content-length: 23
< x-amzn-requestid: 8de09fff-67f2-4d04-b335-64d696c584ff
< 
```

### Respuesta al identificar un **humano**

```js
HTTP/Status: 403
```

#### Ejemplo petición

```sh
curl --location -v --request POST 'https://{API-GATEWAY-URL}/challenge/mutant' \
--header 'Content-Type: application/json' \
--data-raw '{
    "dna": [
        "ATGCAA",
        "ACGCGC",
        "ACTAGT",
        "CAGGAT",
        "CAACTA",
        "ACACTC"
    ]
}'
```
```sh
> POST /challenge/mutant HTTP/2
> Host: 7fu651tpac.execute-api.us-west-2.amazonaws.com
> User-Agent: curl/7.64.1
> Accept: */*
> Content-Type: application/json
> Content-Length: 129
> 
* Connection state changed (MAX_CONCURRENT_STREAMS == 128)!
* We are completely uploaded and fine
< HTTP/2 403 
< date: Wed, 13 Oct 2021 17:15:41 GMT
< content-type: application/json
< content-length: 23
< x-amzn-requestid: 8de09fff-67f2-4d04-b335-64d696c584ff
< 
```

## ***GET:/stats***

### Request

El servicio no requiere parámetros para la consulta

### Response

El servicio responde un **JSON** con la información estadística

#### Ejemplo

```js
{
    "count_mutant_dna": 1,
    "count_human_dna": 1,
    "ratio": 1
}
```

## Testing

Las pruebas unitarias están desarrolladas con ***JEST***, y se usa la libreria ***aws-sdk-mock*** para los servicios de ***aws***.

Para la ejecución de las pruebas unitarias usamos el comando:
```sh
npm run test
```

#### Resultado pruebas unitarias
```sh
mutants-counts
------------------------------|---------|----------|---------|---------|
File                          | % Stmts | % Branch | % Funcs | % Lines |
------------------------------|---------|----------|---------|---------|
All files                     |     100 |      100 |     100 |     100 |
 mutants-counts               |     100 |      100 |     100 |     100 |
  index.js                    |     100 |      100 |     100 |     100 |
 mutants-services/db-services |     100 |      100 |     100 |     100 |
  db-services.js              |     100 |      100 |     100 |     100 |
------------------------------|---------|----------|---------|---------|

mutants-services
------------------------------|---------|----------|---------|---------|
File                          | % Stmts | % Branch | % Funcs | % Lines |
------------------------------|---------|----------|---------|---------|
All files                     |     100 |      100 |     100 |     100 |
 mutants-services             |     100 |      100 |     100 |     100 |
  index.js                    |     100 |      100 |     100 |     100 |
 mutants-services/db-services |     100 |      100 |     100 |     100 |
  db-services.js              |     100 |      100 |     100 |     100 |
------------------------------|---------|----------|---------|---------|
```

## How to deploy

### Creación Servicios AWS
#### - CloudFormation
La creación de los recursos para el despliegue de las funcionalidades se realiza mediante CloudFormation, para ello, se debe crear un stack con el siguiente **yaml**, una vez ejecutado el stack, en la pestaña de ***OUTPUTS*** se encuentran las URL'S para cada servicio.

```yaml
AWSTemplateFormatVersion: 2010-09-09
Description: Mutant Challenge v1

Parameters:
  apiGatewayName:
    Type: String
    Default: mutant-api
  apiStageName:
    Type: String
    AllowedPattern: "[a-z0-9]+"
    Default: challenge
  apiPOSTMethod:
    Type: String
    Default: POST
  apiGETMethod:
    Type: String
    Default: GET
  apiOPTIONSMethod:
    Type: String
    Default: OPTIONS
  lambdaMutantServicesName:
    Type: String
    AllowedPattern: "[a-zA-Z0-9]+[a-zA-Z0-9-]+[a-zA-Z0-9]+"
    Default: mutant-services-stk
  lambdaMutantCountsName:
    Type: String
    AllowedPattern: "[a-zA-Z0-9]+[a-zA-Z0-9-]+[a-zA-Z0-9]+"
    Default: mutant-counts-stk

Resources:
  apiGateway:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Description: Example API Gateway
      EndpointConfiguration:
        Types:
          - REGIONAL
      Name: !Ref apiGatewayName

  apiGatewayPOSTMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      AuthorizationType: NONE
      HttpMethod: !Ref apiPOSTMethod
      Integration:
        IntegrationHttpMethod: POST
        Type: AWS_PROXY
        Uri: !Sub
          - arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${lambdaArn}/invocations
          - lambdaArn: !GetAtt mutantServicesFunction.Arn
      ResourceId: !Ref mutantPathStack
      RestApiId: !Ref apiGateway

  apiGatewayGETMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      AuthorizationType: NONE
      HttpMethod: !Ref apiGETMethod
      Integration:
        IntegrationHttpMethod: POST
        Type: AWS_PROXY
        Uri: !Sub
          - arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${lambdaArn}/invocations
          - lambdaArn: !GetAtt mutantCountsFunction.Arn
      ResourceId: !Ref statsPathStack
      RestApiId: !Ref apiGateway

  apiGatewayOPTIONSServicesMethod:
    Type: 'AWS::ApiGateway::Method'
    Properties:
      ResourceId: !Ref mutantPathStack
      RestApiId: !Ref apiGateway
      HttpMethod: OPTIONS
      AuthorizationType: NONE
      Integration:
        Type: MOCK

  apiGatewayOPTIONSCountsMethod:
    Type: 'AWS::ApiGateway::Method'
    Properties:
      ResourceId: !Ref statsPathStack
      RestApiId: !Ref apiGateway
      HttpMethod: OPTIONS
      AuthorizationType: NONE
      Integration:
        Type: MOCK

  apiGatewayDeployment:
    Type: AWS::ApiGateway::Deployment
    DependsOn:
      - apiGatewayPOSTMethod
      - apiGatewayGETMethod
    Properties:
      RestApiId: !Ref apiGateway
      StageName: !Ref apiStageName

  mutantPathStack:
    Type: 'AWS::ApiGateway::Resource'
    Properties:
      RestApiId: !Ref apiGateway
      ParentId: !GetAtt 
        - apiGateway
        - RootResourceId
      PathPart: mutant
  
  statsPathStack:
    Type: 'AWS::ApiGateway::Resource'
    Properties:
      RestApiId: !Ref apiGateway
      ParentId: !GetAtt 
        - apiGateway
        - RootResourceId
      PathPart: stats

  mutantServicesFunction:
    Type: AWS::Lambda::Function
    Properties:
      Code:
        ZipFile: |
          exports.handler = async (event) => {
            const response = {
              statusCode: 200,
              body: JSON.stringify('mutantServicesLambdaFunction'),
            };
          return response;
          };
      Description: mutant Services Lambda Function
      FunctionName: !Ref lambdaMutantServicesName
      Handler: index.handler
      MemorySize: 128
      Role: !GetAtt lambdaIAMRole.Arn
      Runtime: nodejs14.x

  mutantCountsFunction:
    Type: AWS::Lambda::Function
    Properties:
      Code:
        ZipFile: |
          exports.handler = async (event) => {
            const response = {
              statusCode: 200,
              body: JSON.stringify('mutantCountsLambdaFunction'),
            };
          return response;
          };
      Description: mutant Counts Lambda Function
      FunctionName: !Ref lambdaMutantCountsName
      Handler: index.handler
      MemorySize: 128
      Role: !GetAtt lambdaIAMRole.Arn
      Runtime: nodejs14.x

  mutantServicesApiGatewayInvoke:
    Type: AWS::Lambda::Permission
    DependsOn:
      - apiGateway
      - mutantServicesFunction
    Properties:
      Action: lambda:InvokeFunction
      FunctionName: !Ref mutantServicesFunction
      Principal: apigateway.amazonaws.com
      SourceArn: !Join [
        "", [
          "arn:aws:execute-api:", 
          {"Ref": "AWS::Region"}, ":", 
          {"Ref": "AWS::AccountId"}, ":", 
          !Ref apiGateway, "/*/POST/mutant"
          ]
        ]

  mutantCountsApiGatewayInvoke:
    Type: AWS::Lambda::Permission
    DependsOn:
      - apiGateway
      - mutantCountsFunction
    Properties:
      Action: lambda:InvokeFunction
      FunctionName: !Ref mutantCountsFunction
      Principal: apigateway.amazonaws.com 
      SourceArn: !Join [
        "", [
          "arn:aws:execute-api:", 
          {"Ref": "AWS::Region"}, ":", 
          {"Ref": "AWS::AccountId"}, ":", 
          !Ref apiGateway, "/*/GET/stats"
          ]
        ]

  myDynamoDBTable: 
    Type: AWS::DynamoDB::Table
    Properties: 
      AttributeDefinitions: 
        - 
          AttributeName: "dna"
          AttributeType: "S"
      KeySchema: 
        - 
          AttributeName: "dna"
          KeyType: "HASH"
      TableName: "mutant-registry"
      ProvisionedThroughput: 
        ReadCapacityUnits: "5"
        WriteCapacityUnits: "5"

  lambdaIAMRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: 2012-10-17
        Statement:
          - Action:
              - sts:AssumeRole
            Effect: Allow
            Principal:
              Service:
                - lambda.amazonaws.com
                - apigateway.amazonaws.com
      Policies:
        - PolicyDocument:
            Version: 2012-10-17
            Statement:
              - Action:
                - lambda:InvokeFunction
                Effect: Allow
                Resource: 
                  - '*'
              - Action:
                  - dynamodb:Scan
                  - dynamodb:Query
                  - logs:CreateLogGroup
                  - dynamodb:GetRecords
                Effect: Allow
                Resource:
                  - !Sub arn:aws:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/${lambdaMutantServicesName}:*
                  - !Sub arn:aws:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/${lambdaMutantCountsName}:*
                  - !Sub arn:aws:dynamodb:*:${AWS::AccountId}:table/*/index/*
                  - !Sub arn:aws:dynamodb:*:${AWS::AccountId}:table/*/stream/*
              - Action:
                  - dynamodb:PutItem
                  - dynamodb:DescribeTable
                  - dynamodb:DeleteItem
                  - dynamodb:GetItem
                  - dynamodb:Scan
                  - dynamodb:Query
                  - dynamodb:UpdateItem
                  - logs:CreateLogStream
                  - logs:PutLogEvents
                Effect: Allow
                Resource:
                  - !Sub arn:aws:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/${lambdaMutantServicesName}:*
                  - !Sub arn:aws:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/${lambdaMutantCountsName}:*
                  - !Sub arn:aws:dynamodb:*:${AWS::AccountId}:table/*
          PolicyName: lambda

Outputs:
  POSTDnaServicesURL:
    Value: !Sub https://${apiGateway}.execute-api.${AWS::Region}.amazonaws.com/${apiStageName}/mutant
  GETCountServicesURL:
    Value: !Sub https://${apiGateway}.execute-api.${AWS::Region}.amazonaws.com/${apiStageName}/stats

```
Una vez creada la infraestructura se deben desplegar las fuentes proporcionadas en este repositorio

Para desplegar se debe clonar el repositorio:
```sh
http://github.com/alejoespin/mutant-challenge.git
```
instalar las librerías
```sh
npm i
```
construir los comprimidos para desplegar en AWS
```sh
npm run build
```
dentro de la carpeta ***mutant-challenge/dist*** se encuentran los archivos .zip para ser cargados dentro de las funciones respectivas
```yml
mutant-counts-stk.zip
mutant-services-stk.zip
```

## AWS URL's
Una vez actualizado el código de las respectivas Lambdas podemos realizar peticiones con el **request** mencionado.

Servicio ***POST*** de consulta de ADN
```yml
https://{API-GATEWAY-URL}{API-GATEWAY-URL}/challenge/mutant
```

Servicio ***GET*** para obtener las estadisticas del servicio
```yml
https://{API-GATEWAY-URL}/challenge/stats
```

## Test Environment

El servicio se encuentra desplegado para realizar pruebas en las siguientes URL's

Servicio ***POST*** de consulta de ADN
```yml
https://j6exmvxv99.execute-api.us-west-2.amazonaws.com/challenge/mutant
```

Servicio ***GET*** para obtener las estadisticas del servicio
```yml
https://j6exmvxv99.execute-api.us-west-2.amazonaws.com/challenge/stats
```
