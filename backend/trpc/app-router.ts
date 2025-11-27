import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";

import playersGetAll from "./routes/players/getAll";
import playersCreate from "./routes/players/create";
import playersUpdate from "./routes/players/update";
import playersDelete from "./routes/players/delete";

import tournamentsGetAll from "./routes/tournaments/getAll";
import tournamentsCreate from "./routes/tournaments/create";
import tournamentsUpdate from "./routes/tournaments/update";
import tournamentsDelete from "./routes/tournaments/delete";

import matchesGetAll from "./routes/matches/getAll";
import matchesCreate from "./routes/matches/create";
import matchesCreateBatch from "./routes/matches/createBatch";
import matchesUpdate from "./routes/matches/update";
import matchesDelete from "./routes/matches/delete";

import sponsorsGetAll from "./routes/sponsors/getAll";
import sponsorsCreate from "./routes/sponsors/create";
import sponsorsUpdate from "./routes/sponsors/update";
import sponsorsDelete from "./routes/sponsors/delete";

import pastSeasonsGetAll from "./routes/pastSeasons/getAll";
import pastSeasonsCreate from "./routes/pastSeasons/create";

import broadcastsGetAll from "./routes/broadcasts/getAll";
import broadcastsCreate from "./routes/broadcasts/create";
import broadcastsDelete from "./routes/broadcasts/delete";

import templatesGetAll from "./routes/templates/getAll";
import templatesCreate from "./routes/templates/create";
import templatesDelete from "./routes/templates/delete";

import authLogin from "./routes/auth/login";
import authSignup from "./routes/auth/signup";

import themeGet from "./routes/theme/get";
import themeUpdate from "./routes/theme/update";

import logsGetAll from "./routes/logs/getAll";
import logsCreate from "./routes/logs/create";
import logsClear from "./routes/logs/clear";

import seedInit from "./routes/seed/init";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  players: createTRPCRouter({
    getAll: playersGetAll,
    create: playersCreate,
    update: playersUpdate,
    delete: playersDelete,
  }),
  tournaments: createTRPCRouter({
    getAll: tournamentsGetAll,
    create: tournamentsCreate,
    update: tournamentsUpdate,
    delete: tournamentsDelete,
  }),
  matches: createTRPCRouter({
    getAll: matchesGetAll,
    create: matchesCreate,
    createBatch: matchesCreateBatch,
    update: matchesUpdate,
    delete: matchesDelete,
  }),
  sponsors: createTRPCRouter({
    getAll: sponsorsGetAll,
    create: sponsorsCreate,
    update: sponsorsUpdate,
    delete: sponsorsDelete,
  }),
  pastSeasons: createTRPCRouter({
    getAll: pastSeasonsGetAll,
    create: pastSeasonsCreate,
  }),
  broadcasts: createTRPCRouter({
    getAll: broadcastsGetAll,
    create: broadcastsCreate,
    delete: broadcastsDelete,
  }),
  templates: createTRPCRouter({
    getAll: templatesGetAll,
    create: templatesCreate,
    delete: templatesDelete,
  }),
  auth: createTRPCRouter({
    login: authLogin,
    signup: authSignup,
  }),
  theme: createTRPCRouter({
    get: themeGet,
    update: themeUpdate,
  }),
  logs: createTRPCRouter({
    getAll: logsGetAll,
    create: logsCreate,
    clear: logsClear,
  }),
  seed: createTRPCRouter({
    init: seedInit,
  }),
});

export type AppRouter = typeof appRouter;
