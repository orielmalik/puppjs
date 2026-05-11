const { readJson } =
    require('../Utils/helpers');

class ScenarioFactory {

    constructor(
        dataPath,
        fields,
        maxCases = 3
    ) {

        this.raw =
            readJson(dataPath);

        this.fields =
            fields;

        this.max =
            maxCases;
    }

    build(mode = 'PASS', forcedIndex = null) {

        const scenarios = [];

        const normalizedMode =
            mode.toUpperCase();

        const employees =
            this.raw.employees?.[0] || '1-10';

        for (let i = 0; i < this.max; i++) {

            const testCase = {

                name: '',
                email: '',
                phone: '',
                company: '',
                employees
            };

            for (const field of this.fields) {

                const values =
                    this.raw[field] || [];

                const index =
                    forcedIndex !== null
                        ? forcedIndex
                        : i;

                const value =
                    values[index] ?? '';

                switch (normalizedMode) {

                    case 'PASS':

                        testCase[field] =
                            this.findPassValue(
                                field,
                                values
                            );

                        break;

                    case 'EMPTY':

                        testCase[field] = '';

                        break;

                    case 'FAILED':

                        testCase[field] =
                            this.findFailValue(
                                field,
                                values
                            );

                        break;

                    default:

                        testCase[field] =
                            value;
                }
            }

            scenarios.push(testCase);
        }

        return scenarios;
    }

    findPassValue(field, values) {

        for (const value of values) {

            if (
                this.isValid(
                    field,
                    value
                )
            ) {
                return value;
            }
        }

        return '';
    }

    findFailValue(field, values) {

        for (const value of values) {

            if (
                !this.isValid(
                    field,
                    value
                )
            ) {
                return value;
            }
        }

        return '';
    }

    isValid(field, value) {

        switch (field) {

            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    .test(value);

            case 'phone':
                return /^[+\d\s\-()]{7,}$/
                    .test(value);

            case 'name':
                return /^[a-zA-ZÀ-ÿ\u0590-\u05FF\s'-]{2,}$/
                    .test(value);

            case 'company':
                return /^[a-zA-Z0-9\s&._'-]{2,}$/
                    .test(value);

            default:
                return true;
        }
    }
}

module.exports =
    ScenarioFactory;