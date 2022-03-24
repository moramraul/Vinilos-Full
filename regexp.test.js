
const regExp = {
    regExpDni : "47919013P",
    regExpName : "34",
    regExpEmail : "hola@gmail.com",
    regExpPass : "123465y+",
    regExpCp : "hola",
    regExpTlf : "645754874"
}
    const objExpReg = () => regExp;

    describe('Matchers Strings', () => {
        const exp = objExpReg();
        test('Comprobamos si la respuesta es correcta', () => {
            // NAME
            expect(exp.regExpName).toMatch(/^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ]+$/u);
        });
        test('Comprobamos si la respuesta es incorrecta', () => {
            expect(exp.regExpEmail).toMatch(/^[^@]+@[^@]+\.[a-zA-Z]{2,}$/); // MAIL
        });
        test('Comprobamos si la respuesta tiene una longitud', () => {
            expect(exp.regExpCp).toMatch(/^\d{5}$/); //CP
        });
        test('Comprobamos si la respuesta tiene una longitud', () => {
            expect(exp.regExpPass).toMatch(/^(?=\w*\d)(?=\w*[a-zA-Z])\S{6,10}$/); //PASSWORD
        });
        test('Comprobamos dirección de email', () => {
            expect(exp.regExpDni).toMatch(/^[0-9]{8}\-?[a-zA-Z]{1}/); // DNI
        })
        test('Comprobamos número de teléfono', () => {
            expect(exp.regExpTlf).toMatch(/^[0-9]{9}$/); //TELF
        });
    });