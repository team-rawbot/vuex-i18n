/* vuex-i18n-store defines a vuex module to store locale translations. Make sure
** to also include the file vuex-i18n.js to enable easy access to localized
** strings in your vue components.
*/

// define a simple vuex module to handle locale translations
const i18nVuexModule =  {
	namespaced: true,
	state: {
		locale: null,
		fallback: null,
		translations: {}
	},
	mutations: {

		// set the current locale
		SET_LOCALE(state, payload) {
			state.locale = payload.locale;
		},

		// add a new locale
		ADD_LOCALE(state, payload) {

			// reduce the given translations to a single-depth tree
			var translations = flattenTranslations(payload.translations);

			if (state.translations.hasOwnProperty(payload.locale)) {
				// get the existing translations
				let existingTranslations = state.translations[payload.locale];
				// merge the translations
				state.translations[payload.locale] = Object.assign({}, existingTranslations, translations);

			} else {
				// just set the locale if it does not yet exist
				state.translations[payload.locale] = translations;
			}

			// make sure to notify vue of changes (this might break with new vue versions)
			try {
				if (state.translations.__ob__) {
					state.translations.__ob__.dep.notify();
				}
			} catch(ex) {}

		},

		// replace existing locale information with new translations
		REPLACE_LOCALE(state, payload) {

			// reduce the given translations to a single-depth tree
			var translations = flattenTranslations(payload.translations);

			// replace the translations entirely
			state.translations[payload.locale] = translations;

			// make sure to notify vue of changes (this might break with new vue versions)
			try {
				if (state.translations.__ob__) {
					state.translations.__ob__.dep.notify();
				}
			} catch(ex) {}

		},

		// remove a locale from the store
		REMOVE_LOCALE(state, payload) {

			// check if the given locale is present in the state
			if (state.translations.hasOwnProperty(payload.locale)) {

				// check if the current locale is the given locale to remvoe
				if (state.locale === payload.locale) {
					// reset the current locale
					state.locale = null;
				}

				// create a copy of the translations object
				let translationCopy = Object.assign({}, state.translations);

				// remove the given locale
				delete translationCopy[payload.locale];

				// set the state to the new object
				state.translations = translationCopy;

			}
		},

		SET_FALLBACK_LOCALE(state, payload) {
			state.fallback = payload.locale;
		}

	},
	actions: {

		// set the current locale
		setLocale(context, payload) {
			context.commit({
				type: 'SET_LOCALE',
				locale: payload.locale
			});
		},

		// add or extend a locale with translations
		addLocale(context, payload) {
			context.commit({
				type: 'ADD_LOCALE',
				locale: payload.locale,
				translations: payload.translations
			});
		},

		// replace locale information
		replaceLocale(context, payload) {
			context.commit({
				type: 'REPLACE_LOCALE',
				locale: payload.locale,
				translations: payload.translations
			});
		},

		// remove the given locale translations
		removeLocale(context, payload) {
			context.commit({
				type: 'REMOVE_LOCALE',
				locale: payload.locale,
				translations: payload.translations
			});
		},

		setFallbackLocale(context, payload) {
			context.commit({
				type: 'SET_FALLBACK_LOCALE',
				locale: payload.locale
			});
		}

	}
};

// flattenTranslations will convert object trees for translations into a
// single-depth object tree
const flattenTranslations = function flattenTranslations(translations) {

	let toReturn = {};

	for (let i in translations) {
		const key = i.toLowerCase();
		// check if the property is present
		if (!translations.hasOwnProperty(i)) {
			continue;
		}

		// get the type of the property
		let objType = typeof translations[i];

		// allow unflattened array of strings
		if (isArray(translations[i])) {

			let count = translations[i].length;

			for (let index = 0; index < count; index++) {
				let itemType = typeof translations[i][index];

				if (itemType !== 'string') {
					console.warn('i18n:','currently only arrays of strings are fully supported', translations[i]);
					break;
				}
			}

			toReturn[key] = translations[i];

		} else if (objType == 'object' && objType !== null) {

			let flatObject = flattenTranslations(translations[i]);

			for (let x in flatObject) {
				if (!flatObject.hasOwnProperty(x)) continue;

				toReturn[key + '.' + x] = flatObject[x];
			}

		} else {
			toReturn[key] = translations[i];

		}
	}
	return toReturn;
};

// check if the given object is an array
function isArray(obj) {
	return !!obj && Array === obj.constructor;
}

export default i18nVuexModule;
