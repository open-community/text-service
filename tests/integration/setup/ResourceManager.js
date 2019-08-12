import { api, ResourceType } from '@open-community/service-tools';

class ResourceManager {
    constructor(client) {
        this.client = client;
        this.list = new Set();
    }

    /**
     * Add resource to cleanup
     * @param {ApiId} id
     * @public
     */
    add(id) {
        this.list.add(id);
    }

    /**
     * Cleanup resources
     * @public
     */
    async clean() {
        const promises = Array.from(this.list).map((id) => {
            switch (api.getResourceType(id)) {
            case ResourceType.TEXT: {
                return this.client.text.delete(id);
            }
            default:
                throw new Error('Unknown type');
            }
        });

        await Promise.all(promises);
    }
}

// ============================================================
// Exports
export default ResourceManager;
