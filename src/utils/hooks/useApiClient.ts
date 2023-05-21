import { z } from "zod";

import { version } from "../../../package.json";
import useFetchClient from "./useFetchClient";

import { ApiSettingsModel, UserModel } from "@src/models";

import ApiClient from "@interfaces/api";

import { createBaseError, createResultFromUnknown } from "@utils/parseError";
import parseZodOutput from "@utils/parseZodOutput";

const useApiClient = (): ApiClient => {
	const fetch = useFetchClient();

	return {
		async getChangelog() {
			const path = [import.meta.env.VITE_REPO, version, "CHANGELOG.md"].join(
				"/"
			);

			const changeLogUrl = new URL(path, "https://raw.githubusercontent.com");

			const response = await window
				.fetch(changeLogUrl, {
					method: "GET"
				})
				.then((response) => response.text())
				.then((data) => ({ ok: true as const, data }))
				.catch((error) => {
					return createBaseError({
						kind: "GithubError",
						message: JSON.stringify(error)
					});
				});

			return response;
		},
		async getSettings(baseUrl?: string) {
			return await fetch("/settings", {
				baseUrl,
				method: "GET",
				sendAuth: false,
				useMailSessionToken: false
			})
				.then((response) => {
					if (!response.ok) {
						return response;
					}

					const output = ApiSettingsModel.safeParse(response.data);

					return parseZodOutput(output);
				})
				.catch(createResultFromUnknown);
		},
		async login(baseUrl, password, username) {
			const formData = new FormData();

			if (password !== undefined) formData.append("password", password);
			if (username !== undefined) formData.append("username", username);

			return await fetch("/login", {
				method: "POST",
				contentType: "none",
				baseUrl,
				useMailSessionToken: false,
				body: formData
			})
				.then((response) => {
					if (!response.ok) {
						return response;
					}

					const output = z.string().safeParse(response.data);

					const parsedOutput = parseZodOutput(output);

					if (!parsedOutput.ok) {
						return parsedOutput;
					}

					return { ...parsedOutput, data: undefined };
				})
				.catch(createResultFromUnknown);
		},
		async logout() {
			return await fetch("/logout", {
				useMailSessionToken: false,
				method: "POST"
			}).then((response) => {
				if (!response.ok) return response;

				const output = z.string().safeParse(response.data);

				const parsedOutput = parseZodOutput(output);

				if (!parsedOutput) return parsedOutput;

				return { ok: true, data: undefined };
			});
		},
		async getUser(baseUrl?: string) {
			return await fetch("/user", {
				useMailSessionToken: false,
				baseUrl
			})
				.then((response) => {
					if (!response.ok) return response;

					const output = UserModel.safeParse(response.data);

					const parsedOutput = parseZodOutput(output);

					if (!parsedOutput.ok) return parsedOutput;

					return parsedOutput;
				})
				.catch(createResultFromUnknown);
		}
	};
};

export default useApiClient;
