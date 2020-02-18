module.exports = {
  openapi: '3.0.1',
  info: {
    version: '1.3.0',
    title: 'Payafrik API Endpoints',
    description: 'Payafrik User Management API',
    termsOfService: '',
    contact: {
      name: 'Payafrik',
      email: 'dev.payafrik@gmail.com',
      url: 'http://payafrik,io'
    },
    license: {
      name: 'Apache 2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000/v1/api',
      description: 'Local server'
    },
    {
      url: 'https://api_url_testing',
      description: 'Testing server'
    },
    {
      url: 'https://api_url_production',
      description: 'Production server'
    }
  ],
  security: [
    {
      ApiKeyAuth: []
    }
  ],
  tags: [
    {
      name: 'USER operations'
    }
  ],
  paths: {
    '/users': {
      get: {
        tags: ['USER operations'],
        description: 'Get all system users',
        operationId: 'getUsers',
        parameters: [],
        responses: {
          '200': {
            description: 'Users were found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Users'
                }
              }
            }
          },
          '400': {
            description: 'Missing parameters',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  message: 'companyId is missing',
                  internal_code: 'missing_parameters'
                }
              }
            }
          }
        }
      },
    },
    '/signup': {
      post: {
        tags: ['USER operations'],
        description: 'Signup/Create user',
        operationId: 'createUser',
        parameters: [],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/NewUser'
              }
            }
          },
          required: true
        },
        responses: {
          '200': {
            description: 'New user was created'
          },
          '400': {
            description: 'Invalid parameters',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  message: 'User already exists',
                  status: 'false'
                }
              }
            }
          }
        }
      }
    },
    '/login': {
      post: {
        tags: ['USER operations'],
        description: 'Log in user',
        operationId: 'logInUser',
        parameters: [],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginUser'
              }
            }
          },
          required: true
        },
        responses: {
          '200': {
            description: 'New user was created'
          },
          '400': {
            description: 'Invalid parameters',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  message: 'User already exists',
                  status: 'false'
                }
              }
            }
          }
        }
      }
    },
    '/confirm/{confirmationCode}': {
      put: {
        tags: ['USER operations'],
        description: 'Confirm user account',
        operationId: 'confirmUserAccount',
        parameters: [
          {
            name: 'confirmationCode',
            in: 'path',
            schema: {
              $ref: '#/components/schemas/confirmationCode'
            },
            required: false,
            description: 'Confirmation code sent to user via email after signup'
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/accountConfirmation'
              }
            }
          },
          required: true
        },
        responses: {
          '200': {
            description: 'Account confirmed successfully'
          },
          '400': {
            description: 'Invalid parameters',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  message: 'User not found or account already confirmed',
                  status: 'false'
                }
              }
            }
          }
        }
      }
    },
    '/user': {
      get: {
        tags: ['USER operations'],
        description: 'Get single user details',
        operationId: 'getUserDetails',
        parameters: [],
        responses: {
          '200': {
            description: 'User details found successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
          },
          '400': {
            description: 'Missing parameters',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  message: 'companyId is missing',
                  internal_code: 'missing_parameters'
                }
              }
            }
          }
        }
      },
    },

  },
  components: {
    schemas: {
      firstName: {
        type: 'string',
        description: 'User first name',
        example: 'John'
      },
      lastName: {
        type: 'string',
        description: 'User last name',
        example: 'Doe'
      },
      username: {
        type: 'string',
        description: 'Unique username',
        example: 'johndoe'
      },
      userType: {
        type: 'string',
        description: 'the type of user account, users ara basic users while system admin administers the account',
        enum:  ['SYSTEM_ADMIN','USER'],
        example: 'USER'
      },
      email: {
        type: 'String',
        description: 'User\'s email address',
        example: 'johndoe@email.com'
      },
      phone: {
        type: 'String',
        description: 'User\'s phone number with country code',
        example: '+2348012345678'
      },
      confirmationCode: {
        type: 'String',
        description: 'User\'s confirmation code. sent to the user via email after signup',
        example: 'NhL0jb7ME4ohSxoI2YLhChKIyGnYTekeSvy'
      },
      password: {
        type: 'String',
        description: 'User\'s password',
        example: 'password'
      },
      tokens: {
        type: 'integer',
        description: 'Amount of AFK tokens the user has',
        example: 24
      },
      dob: {
          type: 'integer',
          description: 'User\'s date of birth in milliseconds',
          example: 1580994800
      },
      confirmed:{
          type: 'Boolean',
          description: 'User\'s account email confirmation status. true means it has been confirmed',
          example: true
      },
      addressLine: { 
        type: 'String', 
        description: 'User\'s street address',
        example: '123, some street'
      },
      location: { 
          type: 'String', 
          description: 'Location of user\'s address',
          example: 'Abuja'
      },
      coordinates: {
          type: 'String',
          description: 'User\'s GPS coordinates gotten from google\'s geocoding API',
          example: '+2348012345678'
      },
      documentType: { 
        type: 'String',
        description: 'the type of document uploaded',
        enum:  ['CERTIFICATE','ID'],
        example: 'ID'
      },
      documentS3Url: { 
          type: 'String', 
          description: 'the s3 Url of the uploaded document',
          example: 'https://s3.amazonaws.com/example/image-sdkugoe4tign.jpeg'
      },
      documentStatus: {
          type: 'String',
          description: 'Document approval status. APPROVED afer being reviewed and approved by a payafrik administrator',
          enum : ['APPROVED','PENDING','REJECTED'],
          example: 'PENDING'
      },
      NewUser: {
        type: 'object',
        properties: {
          username: {
            $ref: '#/components/schemas/username'
          },
          email: {
            $ref: '#/components/schemas/email'
          },
          password: {
            $ref: '#/components/schemas/password'
          },
          phone: {
            $ref: '#/components/schemas/phone'
          },
        }
      },
      LoginUser: {
        type: 'object',
        properties: {
          username: {
            $ref: '#/components/schemas/username'
          },
          password: {
            $ref: '#/components/schemas/password'
          }
        }
      },
      accountConfirmation: {
        type: 'object',
        properties: {
          firstName: {
            $ref: '#/components/schemas/firstName'
          },
          lastName: {
            $ref: '#/components/schemas/lastName'
          },
          address: {
            type: 'object',
              properties: {
              addressLine: {
                $ref: '#/components/schemas/addressLine'
              },
              location: {
                $ref: '#/components/schemas/location'
              }
            }
          },
        }
      },
      User: {
        type: 'object',
        properties: {
          username: {
            $ref: '#/components/schemas/username'
          },
          firstName: {
            $ref: '#/components/schemas/firstName'
          },
          lastName: {
            $ref: '#/components/schemas/lastName'
          },
          userType: {
            $ref: '#/components/schemas/userType'
          },
          email: {
            $ref: '#/components/schemas/email'
          },
          phone: {
            $ref: '#/components/schemas/phone'
          },
          tokens: {
            $ref: '#/components/schemas/tokens'
          },
          dob: {
            $ref: '#/components/schemas/dob'
          },
          confirmed: {
            $ref: '#/components/schemas/confirmed'
          },
          address: {
            type: 'object',
              properties: {
              addressLine: {
                $ref: '#/components/schemas/addressLine'
              },
              location: {
                $ref: '#/components/schemas/location'
              },
              coordinates: {
                $ref: '#/components/schemas/coordinates'
              },
            }
          },
          kycDocs: {
            type: 'array',
              items: {
                type: 'object',
                properties: {
                  documentType: {
                    $ref: '#/components/schemas/documentType'
                  },
                  documentS3Url: {
                    $ref: '#/components/schemas/documentS3Url'
                  },
                  documentStatus: {
                    $ref: '#/components/schemas/documentStatus'
                  },
                }
            }
          }
        }
      },
      Users: {
        type: 'object',
        properties: {
          users: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/User'
            }
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          message: {
            type: 'string'
          },
          status: {
            type: 'Boolean'
          }
        }
      }
    },
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization'
      }
    }
  }
};