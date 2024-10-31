import { DataSource } from "typeorm";
import { AppDataSource } from "../data-source";

let currentDataSource: DataSource = AppDataSource;

export const setDataSource = (dataSource: DataSource) => {
  currentDataSource = dataSource;
};

export const getDataSource = () => currentDataSource;
