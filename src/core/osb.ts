#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import * as SwaggerParser from "swagger-parser";
import { Console } from "../helpers/Console";
import { IOptions, IPlugin, IPluginOptions } from "../interfaces";
declare var require: any;
/**
 * @module OpenAPISDKBuilder
 * @author Jonathan Casarrubias <t:@johncasarrubias> github mean-expert-official
 * @license MIT
 * @description The OpenAPI SDK Builder is a tool created to help you to automatically
 *  build Software Development Kits from an OpenAPI Specification file
 */
export class OpenAPISDKBuilder {
  /**
   * SDK Context Options
   */
  private options: IOptions = {
    api: "",
    plugins: [],
    sdk: "",
    settings: {
      verbose: false,
    },
  };
  /**
   * SDK Builder Constructor
   */
  constructor() { this.setup(); }
  /**
   * @method setup
   * @description This method will get the options from a sdk.config.json file
   * located in the root of a project and then parse the specification file
   * and finally it will call the bootstrap method to load all the configured plugins.
   */
  private async setup() {
    await this.setupOptions();
    SwaggerParser.parse(this.options.api, (err: Error, api: object) => {
      if (err) {
        throw err;
      } else {
        this.bootstrap(api);
      }
    });
  }
  /**
   * @method setup
   * @description This method will get the options from a sdk.config.json file
   * located in the root of a project and then parse the specification file
   * and finally it will call the bootstrap method to load all the configured plugins.
   */
  private setupOptions(): Promise<void> {
    return new Promise<void>((resolve: () => void) => {
      const configPath: string = path.resolve(process.cwd(), "sdk.config.json");
      fs.readFile(configPath, (err: Error, data: any) => {
        if (err) {
          throw err;
        } else {
          this.options = Object.assign(this.options, JSON.parse(data.toString()));
          Console.options = this.options;
          Console.time("SDK Build Time");
          Console.log(`Loaded config file: ${ configPath }`);
          resolve();
        }
      });
    });
  }
  /**
   * @method bootstrap
   * @description This method will get the options from a sdk.config.json file
   * located in the root of a project and then parse the specification file
   * and finally it will call the bootstrap method to load all the configured plugins.
   */
  private bootstrap(api: object): void {
    if (!Array.isArray(this.options.plugins)) {
      throw new Error("Use the plugins array property to set which ones should be used");
    }
    Console.log("\n--------------------------------------------------------------------\n");
    this.options.plugins.forEach((pluginOptions: IPluginOptions) => {
      const module: any = require(`../plugins/${ pluginOptions.name }`);
      const plugin: IPlugin = new module[pluginOptions.name](api, this.options);
      plugin.build();
    });
    Console.log("\n--------------------------------------------------------------------");
    Console.timeEnd("SDK Build Time");
    Console.log("--------------------------------------------------------------------");
  }
}
