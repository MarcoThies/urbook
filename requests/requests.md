## API status

#### GET /status

### Result
> **status**: boolean

> **timestamp**: MM/DD/YYYY

## Register User

#### POST /auth/register 

### Body
> **username**: String

> **password**: String

> **email**: String

### Result
> **success**: Boolean

> **message**: String

> **code**: Number

301: username already in use  
302: email-address already in use  
200: user account created sucessfully

## Login User

#### POST /auth/register

### Body
> **username** / **email**: String

> **password**: String

### Result

> Fail
>> **message**: String 
> 
>> **code**: Number

> 301: user not found in database  
> 302: password incorrect

> Success
>> **username**: String
>
>> **accessToken**: String
>
>> **timestamp**: Number


## User information
Get Information of currently logged in User

#### GET user/profile

### Result
> Fail
>> **code**: Number
>
>> **timestamp**: String
>
>> **path**: String
>
>> **method**: String
>
>> **message**: String


> Success
>> **id**: String
>
>> **username**: String
>
>> **email**: String

