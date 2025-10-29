import { TestProjTemplatePage } from './app.po';

describe('TestProj App', function () {
    let page: TestProjTemplatePage;

    beforeEach(() => {
        page = new TestProjTemplatePage();
    });

    it('should display message saying app works', () => {
        page.navigateTo();
        expect(page.getParagraphText()).toEqual('app works!');
    });
});
