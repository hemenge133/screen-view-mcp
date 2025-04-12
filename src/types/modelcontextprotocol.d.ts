declare module '@modelcontextprotocol/sdk/dist/cjs/server' {
  export interface ServerConfig {
    info: {
      name: string;
      version: string;
      description: string;
    };
  }

  export class Server {
    constructor(config: ServerConfig);
    registerTool(tool: {
      name: string;
      description: string;
      parameters: any;
      handler: (params: any) => Promise<any>;
    }): void;
    listen(port: number, callback: () => void): void;
  }
} 