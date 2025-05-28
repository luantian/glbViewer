import { faker } from '@faker-js/faker';

export default class Mock {

    static createMonitor() {
        const currentTemp = faker.number.float({
            min: 10,
            max: 100,
            precision: 0.1
        });

        const dangerThreshold = 60;

        // status 0 => danger  1 => warning  2 => normal
        const status = currentTemp >= dangerThreshold - 5 ?
            (currentTemp >= dangerThreshold ? 0 : 1) : 2;

        const position = { x: Math.random() * 6 - 3, y: Math.random() * 1.6 - 0.8, z: Math.random() * 4 - 2 }

        return {
            id: `water-${faker.string.numeric(3)}`,
            position,
            label: `冷却系统${faker.string.alpha(1)}-${faker.helpers.arrayElement(['入水口', '出水口', '循环泵'])}`,
            temperature: currentTemp,
            unit: "°C",
            status,
            dangerThreshold: dangerThreshold,
            lastDanger: status !== 2 ?
                faker.date.recent({ days: 30 }).toISOString() :
                null,
            timestamp: faker.date.recent({ days: 7 }).toISOString()
        };
    }

    static generateBatchWaterData(count = 100) {
        return Array.from({ length: count }, () => Mock.createMonitor());
    };

}