export default class ChatCache {
    private cache: { id: number, beatmapId: number }[] = [];

    public getChatMap(id: number): number {
        return this.cache.find(m => m.id == id)?.beatmapId ?? null;
    }

    public setChatMap(id: number, beatmapId: number): void {
        let i = this.cache.findIndex(m => m.id == id);

        if(i == -1)
            this.cache.push({ id, beatmapId });
        else
            this.cache[i].beatmapId = beatmapId;
    }
}