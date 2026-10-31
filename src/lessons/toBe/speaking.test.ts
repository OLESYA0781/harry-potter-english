import {expect,it} from 'vitest';
import {describeFrames,describeScenes,falseScenes,sceneIndex,townPlaces,townTransport,whoScenes,wordKey} from './speaking';
it('has four paired portraits, town descriptions and exactly three false-fact scenes',()=>{
 expect(whoScenes).toHaveLength(4);expect(whoScenes.every(scene=>scene.questions?.length===5)).toBe(true);
 expect(describeScenes).toHaveLength(8);expect(describeScenes.every(scene=>scene.picture && scene.questions?.length && scene.answers?.length)).toBe(true);expect(describeFrames).toContain('I am … .');expect(falseScenes).toHaveLength(3);expect(falseScenes.every(scene=>scene.facts?.length===3 && scene.answers?.length===3)).toBe(true);
});
it('retains every Go Getter place and transport word with stable noncolliding reveal keys',()=>{
 expect(townPlaces.map(word=>word.en)).toEqual(['bank','café','cinema','hospital','hotel','museum','park','restaurant','stadium','theatre']);
 expect(townTransport.map(word=>word.en)).toEqual(['bike','boat','bus','car','motorbike','plane','taxi','train','tram','underground']);
 expect(new Set([...townPlaces,...townTransport].map(word=>wordKey(word.id))).size).toBe(20);
});

it('replaces the old empty-room scene with hospital vocabulary and preserves its saved selection',()=>{
 expect(sceneIndex(falseScenes,'common-room')).toBe(1);expect(falseScenes[1].id).toBe('hospital');
 expect(falseScenes[1].picture).toEqual({atlas:'places',index:3});
 expect(falseScenes[1].facts).toEqual(['This is a hotel.','This is a museum.','This is a bank.']);
 expect(falseScenes[1].answers).toContain('This is a hospital.');
});
