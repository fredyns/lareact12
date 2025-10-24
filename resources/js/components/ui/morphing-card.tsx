import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, X, Eye, Edit, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface MorphingCardProps {
  id: string;
  title: string;
  description: string;
  image?: string;
  isExpanded?: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
  className?: string;
  onPreview?: () => void;
  onViewDetails?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  actionText?: string;
}

const cardVariants = {
  collapsed: {
    scale: 1,
    transition: { duration: 0.2 },
  },
  expanded: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
};

export function MorphingCard({
  id,
  title,
  description,
  image,
  isExpanded = false,
  onExpand,
  onCollapse,
  className = "",
  onPreview,
  onViewDetails,
  onEdit,
  onDelete,
  actionText = "View Details",
}: MorphingCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCardClick = () => {
    setShowPreview(true);
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        className={`relative h-full cursor-pointer ${className}`}
        variants={!isMobile ? cardVariants : undefined}
        initial="collapsed"
        animate={isHovered ? "hover" : "collapsed"}
        onHoverStart={() => !isMobile && setIsHovered(true)}
        onHoverEnd={() => !isMobile && setIsHovered(false)}
        onClick={handleCardClick}
        layout
      >
        <div className="relative h-full overflow-hidden rounded-xl bg-card text-card-foreground shadow-sm border border-border/40">
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            {image ? (
              <img
                src={image}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-muted/20 to-muted/40 flex items-center justify-center">
                <span className="text-muted-foreground/50 text-sm">No image</span>
              </div>
            )}
            
            {/* 3-dot menu */}
            <div 
              className={`absolute top-2 right-2 p-1 rounded-full bg-background/80 backdrop-blur-sm transition-opacity ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
            >
              <MoreVertical className="h-5 w-5 text-foreground/70 cursor-pointer" />
            </div>
            
            {/* Actions Dropdown */}
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-2 top-10 z-20 w-40 rounded-md bg-background shadow-lg ring-1 ring-black/5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="py-1">
                    <button
                      className="w-full px-4 py-2 text-left text-sm hover:bg-muted/50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowActions(false);
                        setShowPreview(true);
                      }}
                    >
                      View
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-sm hover:bg-muted/50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowActions(false);
                        onEdit?.();
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-muted/50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowActions(false);
                        onDelete?.();
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="text-lg font-semibold line-clamp-1">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowPreview(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setShowPreview(false)}
            >
              <motion.div
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-background shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={() => setShowPreview(false)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Image */}
                {image && (
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={image}
                      alt={title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                  </div>


                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => {
                        setShowPreview(false);
                        onViewDetails?.();
                      }}
                      className="flex-1 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        setShowPreview(false);
                        onEdit?.();
                      }}
                      className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setShowPreview(false);
                        onDelete?.();
                      }}
                      className="flex-1 rounded-md bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
