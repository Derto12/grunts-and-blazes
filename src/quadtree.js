class Quadtree {
    constructor(bounds, maxObjects = 10, maxDepth = 5) {
      this.bounds = bounds;
      this.maxObjects = maxObjects;
      this.maxDepth = maxDepth;
      this.objects = [];
      this.nodes = [];
    }
  
    clear() {
      this.objects = [];
      for (const node of this.nodes) {
        node.clear();
      }
      this.nodes = [];
    }
  
    split() {
      const subWidth = this.bounds.width / 2;
      const subHeight = this.bounds.height / 2;
      const x = this.bounds.x;
      const y = this.bounds.y;
      this.nodes.push(new Quadtree({ x: x + subWidth, y, width: subWidth, height: subHeight }, this.maxObjects, this.maxDepth));
      this.nodes.push(new Quadtree({ x, y, width: subWidth, height: subHeight }, this.maxObjects, this.maxDepth));
      this.nodes.push(new Quadtree({ x, y: y + subHeight, width: subWidth, height: subHeight }, this.maxObjects, this.maxDepth));
      this.nodes.push(new Quadtree({ x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight }, this.maxObjects, this.maxDepth));
    }
  
    getIndex(object) {
      const verticalMidpoint = this.bounds.x + this.bounds.width / 2;
      const horizontalMidpoint = this.bounds.y + this.bounds.height / 2;
  
      const objectLeft = object.position.x;
      const objectRight = object.position.x + object.width;
      const objectTop = object.position.y;
      const objectBottom = object.position.y + object.height;
  
      const topQuadrant = objectTop < horizontalMidpoint && objectBottom < horizontalMidpoint;
      const bottomQuadrant = objectTop > horizontalMidpoint;
  
      if (objectLeft < verticalMidpoint && objectRight < verticalMidpoint) {
        if (topQuadrant) {
          return 1;
        } else if (bottomQuadrant) {
          return 2;
        }
      } else if (objectLeft > verticalMidpoint) {
        if (topQuadrant) {
          return 0;
        } else if (bottomQuadrant) {
          return 3;
        }
      }
  
      return -1;
    }
  
    insert(object) {
      if (this.nodes.length) {
        const index = this.getIndex(object);
        if (index !== -1) {
          this.nodes[index].insert(object);
          return;
        }
      }
  
      this.objects.push(object);
  
      if (this.objects.length > this.maxObjects && this.maxDepth > 0) {
        if (!this.nodes.length) {
          this.split();
        }
  
        let i = 0;
        while (i < this.objects.length) {
          const index = this.getIndex(this.objects[i]);
          if (index !== -1) {
            this.nodes[index].insert(this.objects.splice(i, 1)[0]);
          } else {
            i++;
          }
        }
      }
    }
  
    retrieve(object) {
      const index = this.getIndex(object);
      let found = [...this.objects];
      if (this.nodes.length) {
        if (index !== -1) {
          found.push(...this.nodes[index].retrieve(object));
        } else {
          for (const node of this.nodes) {
            found.push(...node.retrieve(object));
          }
        }
      }
      return found;
    }
}

module.exports = Quadtree
