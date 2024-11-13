// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { Divider } from "primereact/divider";
// import { Toast } from "primereact/toast";
// import { RadioButton } from "primereact/radiobutton";
// import ImageIcon from "../../../components/ImageIcon";
// import storage from "../../../utils/storage";
// import appActions from "../../../appActions";

// const URL = window?.config?.END_POINT;

// const categories = [
//     { id: "coffee", name: "coffee" },
//     { id: "bottled", name: "bottled" },
//     { id: "drinks", name: "drinks" },
//     { id: "sets", name: "sets" },
//     { id: "snacks", name: "snacks" },
//     { id: "beans", name: "beans" },
//     { id: "gifts", name: "gifts" },
// ];

// const productsByCategory = {
//     coffee: [
//         {
//             id: "espresso",
//             name: "Espresso",
//             description: "Rich and bold espresso.",
//         },
//     ],
//     bottled: [
//         {
//             id: "iced_coffee",
//             name: "Iced Coffee",
//             description: "Chilled coffee in a bottle.",
//         },
//     ],
//     drinks: [
//         {
//             id: "campfire_chocolate",
//             name: "Campfire Chocolate",
//             description:
//                 "Double chocolate with toasted vanilla marshmallow creme",
//         },
//         {
//             id: "chocolate_milk",
//             name: "Chocolate Milk",
//             description: "Dark chocolate with milk",
//         },
//         {
//             id: "matcha_latte",
//             name: "Matcha Latte",
//             description: "Green tea with milk, microfoam, and 1cm wet foam",
//         },
//         {
//             id: "orange_cinnamon_iced_tea",
//             name: "Orange Cinnamon Iced Tea",
//             description: "Blend of orange, cinnamon, and cloves",
//         },
//         {
//             id: "mixed_berries_iced_tea",
//             name: "Mixed Berries Iced Tea",
//             description: "Hibiscus, blueberry, raspberry, and blackberry",
//         },
//         {
//             id: "san_pellegrino",
//             name: "San Pellegrino",
//             description: "Sparkling water",
//         },
//     ],
//     sets: [
//         {
//             id: "espresso",
//             name: "Espresso",
//             description: "Rich and bold espresso.",
//         },
//     ],
//     snacks: [
//         {
//             id: "iced_coffee",
//             name: "Iced Coffee",
//             description: "Chilled coffee in a bottle.",
//         },
//     ],
//     beans: [
//         {
//             id: "campfire_chocolate",
//             name: "Campfire Chocolate",
//             description:
//                 "Double chocolate with toasted vanilla marshmallow creme",
//         },
//         {
//             id: "chocolate_milk",
//             name: "Chocolate Milk",
//             description: "Dark chocolate with milk",
//         },
//         {
//             id: "matcha_latte",
//             name: "Matcha Latte",
//             description: "Green tea with milk, microfoam, and 1cm wet foam",
//         },
//         {
//             id: "orange_cinnamon_iced_tea",
//             name: "Orange Cinnamon Iced Tea",
//             description: "Blend of orange, cinnamon, and cloves",
//         },
//         {
//             id: "mixed_berries_iced_tea",
//             name: "Mixed Berries Iced Tea",
//             description: "Hibiscus, blueberry, raspberry, and blackberry",
//         },
//         {
//             id: "san_pellegrino",
//             name: "San Pellegrino",
//             description: "Sparkling water",
//         },
//     ],
// };

// const ProductMenu = () => {
//     const [activeCategory, setActiveCategory] = useState("COFFEE");
//     const categoryRefs = useRef({});

//     const dispatch = useDispatch();
//     const navigate = useNavigate();

//     const [activeTab, setActiveTab] = useState(0); // Track active tab
//     const contentRef = useRef(null);
//     const storeid = storage.get("storeid");
//     const terminalid = storage.get("terminalid");

//     const [productGroups, setProductGroups] = useState();
//     const [menuItems, setMenuItems] = useState([]);
//     const [selectedItem, setSelectedItem] = useState({});
//     const [productItems, setProductItems] = useState([]);
//     const [isDetail, setIsDetail] = useState(false);
//     const [order, setOrder] = useState();
//     const [cartDetail, setCartDetail] = useState({});
//     const [currCart, setCurrCart] = useState({});
//     const [categoryGroup, setCategoryGroup] = useState([]);

//     const [categories, setCategory] = useState([])

//     const productList = useSelector((state) => state.product.productList);

//     useEffect(() => {
//         const catCode = storage.get("categoryCode");
//         if (storeid && catCode) {
//             const defaultParams = {
//                 language: "en",
//                 segment: "T1",
//                 sort: "sortorder",
//                 status: "Active",
//                 storeid: storeid,
//                 categorycodes: storage.get("categoryCode"),
//             };
//             dispatch(appActions.PRODUCT_GET_ALL_REQUEST(defaultParams));
//         }
//     }, [dispatch, storeid]);

//     useEffect(() => {
//         const uniqueProductGroups = [
//             ...new Set(productList.map((product) => product.categorycodes)),
//         ];

//         uniqueProductGroups.map((group) => {
//             getMenuName(group);
//         });
//         setProductGroups(uniqueProductGroups);
//         const result = uniqueProductGroups.map((product) => {
//             return { id: product, name: product }
//         });
//         setCategory(result)
//     }, [productList]);

//     useEffect(() => {
//         const categorizedProducts = {};
//         categoryGroup.forEach(category => {
//             categorizedProducts[category.categorycodes] = productList
//                 .filter(product => product.categorycodes === category.categorycodes)
//                 .map(product => (product));
//         });
//         setProductItems(categorizedProducts)
//     }, [categoryGroup])

//     const getMenuName = async (category) => {
//         const config = {
//             method: "get",
//             maxBodyLength: Infinity,
//             url: `${URL}/sales/v1/category/search/fields?categorycode=${category}`,
//             headers: {
//                 Authorization: "test",
//             },
//         };
    
//         try {
//             const response = await axios.request(config); // Await the response here
//             if (response.status === 200) {
//                 if (response.data.length > 0) {
//                     const { title, sortorder } = response.data[0];
//                     // Update state with sorted categoryGroup
//                     setCategoryGroup((prevCategoryGroup) => {
//                         const updatedCategoryGroup = [
//                             ...prevCategoryGroup,
//                             {
//                                 id: category,
//                                 name: title,
//                                 categorycodes: category,
//                                 sortorder,
//                             },
//                         ];
//                         // Sort by sortorder
//                         return updatedCategoryGroup.sort((a, b) => a.sortorder - b.sortorder);
//                     });
//                 }
//             }
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     useEffect(() => {
//         const observer = new IntersectionObserver(
//             (entries) => {
//                 entries.forEach((entry) => {
//                     console.log('entry', entry)
//                     if (entry.isIntersecting) {
//                         setActiveCategory(entry.target.id);
//                     }
//                 });
//             },
//             { threshold: 0.5, rootMargin: "0px 0px -20% 0px" }, // Adjust to trigger category switch when the category is halfway visible
//         );

//         Object.values(categoryRefs.current).forEach((ref) =>
//             observer.observe(ref),
//         );

//         return () => observer.disconnect();
//     }, []);

//     const handleCategoryClick = (categoryId) => {
//         document
//             .getElementById(categoryId)
//             ?.scrollIntoView({ behavior: "smooth" });
//         setActiveCategory(categoryId);
//     };
//     return (
//         <div className="product-menu">
//             <div className="category-bar">
//                 <div className="category-container">
//                     {categoryGroup.map((category) => (
//                         <div
//                             key={category.id}
//                             className={`category-item ${category.id === activeCategory ? "active" : ""}`}
//                             onClick={() => handleCategoryClick(category.id)}
//                         >
//                             {category.name}
//                         </div>
//                     ))}
//                 </div>
//             </div>
//             <div className="product-list">
//                 {Object.entries(productItems).map(
//                     ([categorycode, products]) => (
//                         <div
//                             key={categorycode}
//                             id={categorycode}
//                             ref={(el) =>
//                                 (categoryRefs.current[categorycode] = el)
//                             }
//                             className="category-section"
//                         >
//                             {products.map((product) => (
//                                 <div
//                                     key={product.id}
//                                     className="product-item"
//                                     style={{ height: "100px" }}
//                                 >
//                                     <div className="menu-item-details">
//                                         <h3>{product.additionalfields.title}</h3>
//                                         <p className="mb-0">
//                                             {product?.articlefields?.description}
//                                         </p>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     ),
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ProductMenu;
